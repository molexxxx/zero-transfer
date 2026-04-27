/**
 * Classic FTP provider backed by MLST/MLSD metadata commands.
 *
 * @module providers/classic/ftp/FtpProvider
 */
import { Buffer } from "node:buffer";
import { createConnection, type Socket } from "node:net";
import type { CapabilitySet } from "../../../core/CapabilitySet";
import type { TransferSession } from "../../../core/TransferSession";
import {
  AbortError,
  AuthenticationError,
  ConnectionError,
  PathNotFoundError,
  ProtocolError,
  TimeoutError,
} from "../../../errors/ZeroFTPError";
import { resolveConnectionProfileSecrets } from "../../../profiles/resolveConnectionProfileSecrets";
import type { ProviderFactory } from "../../ProviderFactory";
import type { TransferProvider } from "../../Provider";
import type { RemoteFileSystem } from "../../RemoteFileSystem";
import type { ConnectionProfile, RemoteEntry, RemoteStat } from "../../../types/public";
import {
  assertSafeFtpArgument,
  basenameRemotePath,
  normalizeRemotePath,
} from "../../../utils/path";
import { parseMlsdLine, parseMlsdList } from "./FtpListParser";
import { FtpResponseParser, type FtpResponse } from "./FtpResponseParser";

const FTP_PROVIDER_ID = "ftp";
const DEFAULT_FTP_PORT = 21;

const FTP_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: FTP_PROVIDER_ID,
  authentication: ["anonymous", "password"],
  list: true,
  stat: true,
  readStream: false,
  writeStream: false,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: false,
  resumeUpload: false,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: ["modifiedAt", "permissions", "uniqueId"],
  maxConcurrency: 1,
  notes: ["Classic FTP provider foundation with MLST/MLSD metadata support"],
};

/** Options used to create the classic FTP provider factory. */
export interface FtpProviderOptions {
  /** Default control port used when a connection profile omits `port`. */
  defaultPort?: number;
}

/**
 * Creates a provider factory for classic FTP connections.
 *
 * @param options - Optional provider defaults.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createFtpProviderFactory(options: FtpProviderOptions = {}): ProviderFactory {
  return {
    id: FTP_PROVIDER_ID,
    capabilities: FTP_PROVIDER_CAPABILITIES,
    create: () => new FtpProvider(options),
  };
}

class FtpProvider implements TransferProvider {
  readonly id = FTP_PROVIDER_ID;
  readonly capabilities = FTP_PROVIDER_CAPABILITIES;

  constructor(private readonly options: FtpProviderOptions) {}

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const port = resolvedProfile.port ?? this.options.defaultPort ?? DEFAULT_FTP_PORT;
    const connectOptions: FtpConnectOptions = {
      host: resolvedProfile.host,
      port,
    };

    if (resolvedProfile.signal !== undefined) {
      connectOptions.signal = resolvedProfile.signal;
    }

    if (resolvedProfile.timeoutMs !== undefined) {
      connectOptions.timeoutMs = resolvedProfile.timeoutMs;
    }

    const control = await FtpControlConnection.connect(connectOptions);

    try {
      await authenticateFtpSession(
        control,
        resolvedProfile.username === undefined
          ? "anonymous"
          : secretToString(resolvedProfile.username),
        resolvedProfile.password === undefined
          ? "anonymous@"
          : secretToString(resolvedProfile.password),
        resolvedProfile.host,
      );
      return new FtpTransferSession(control);
    } catch (error) {
      control.close();
      throw error;
    }
  }
}

class FtpTransferSession implements TransferSession {
  readonly provider = FTP_PROVIDER_ID;
  readonly capabilities = FTP_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;

  constructor(private readonly control: FtpControlConnection) {
    this.fs = new FtpFileSystem(control);
  }

  async disconnect(): Promise<void> {
    try {
      await this.control.sendCommand("QUIT");
    } catch {
      // The connection is closing anyway; callers should not see QUIT cleanup noise.
    } finally {
      this.control.close();
    }
  }
}

class FtpFileSystem implements RemoteFileSystem {
  constructor(private readonly control: FtpControlConnection) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const remotePath = normalizeFtpPath(path);
    await this.expectCompletion("TYPE I", remotePath);
    const payload = await this.readPassiveDataCommand(`MLSD ${remotePath}`, remotePath);
    return parseMlsdList(payload.toString("utf8"), remotePath).sort(compareEntries);
  }

  async stat(path: string): Promise<RemoteStat> {
    const remotePath = normalizeFtpPath(path);
    const response = await this.control.sendCommand(`MLST ${remotePath}`);
    assertPathCommandSucceeded(response, "MLST", remotePath);

    const factLine = response.lines.map((line) => line.trim()).find(isFtpFactLine);

    if (factLine === undefined) {
      throw createProtocolError("MLST", "FTP MLST response did not include a fact line", response);
    }

    const entry = parseMlsdLine(factLine, getParentPath(remotePath) ?? "/");

    return {
      ...entry,
      exists: true,
      name: basenameRemotePath(remotePath),
      path: remotePath,
    };
  }

  private async expectCompletion(command: string, path: string): Promise<void> {
    const response = await this.control.sendCommand(command);
    assertPathCommandSucceeded(response, command, path);
  }

  private async readPassiveDataCommand(command: string, path: string): Promise<Buffer> {
    const passiveResponse = await this.control.sendCommand("PASV");
    assertPathCommandSucceeded(passiveResponse, "PASV", path);
    const dataConnection = openPassiveDataConnection(parsePassiveEndpoint(passiveResponse));

    try {
      await dataConnection.ready;
      this.control.writeCommand(command);
      const initialResponse = await this.control.readResponse();

      if (!initialResponse.preliminary) {
        dataConnection.close();
        assertPathCommandSucceeded(initialResponse, command, path);
        throw createProtocolError(
          command,
          "FTP data command did not open a data transfer",
          initialResponse,
        );
      }

      const payload = await dataConnection.data;
      const finalResponse = await this.control.readFinalResponse();
      assertPathCommandSucceeded(finalResponse, command, path);
      return payload;
    } catch (error) {
      dataConnection.close();
      throw error;
    }
  }
}

interface FtpConnectOptions {
  host: string;
  port: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

interface ResponseWaiter {
  resolve(response: FtpResponse): void;
  reject(error: Error): void;
}

class FtpControlConnection {
  private readonly parser = new FtpResponseParser();
  private readonly responses: FtpResponse[] = [];
  private readonly waiters: ResponseWaiter[] = [];
  private closedError: Error | undefined;

  private constructor(
    private readonly socket: Socket,
    private readonly host: string,
  ) {
    this.socket.on("data", (chunk) => this.handleData(chunk));
    this.socket.on("error", (error) => this.failPending(createConnectionError(this.host, error)));
    this.socket.on("close", () => {
      this.failPending(
        new ConnectionError({
          host: this.host,
          message: "FTP control connection closed",
          protocol: FTP_PROVIDER_ID,
          retryable: true,
        }),
      );
    });
  }

  static async connect(options: FtpConnectOptions): Promise<FtpControlConnection> {
    const socket = createConnection({ host: options.host, port: options.port });
    const control = new FtpControlConnection(socket, options.host);

    try {
      await waitForSocketConnect(socket, options);
      const greeting = await control.readFinalResponse();

      if (!greeting.completion) {
        throw createProtocolError("greeting", "FTP server greeting was not successful", greeting);
      }

      return control;
    } catch (error) {
      control.close();
      throw error;
    }
  }

  writeCommand(command: string): void {
    this.socket.write(`${command}\r\n`);
  }

  async sendCommand(command: string): Promise<FtpResponse> {
    this.writeCommand(command);
    return this.readFinalResponse();
  }

  async readFinalResponse(): Promise<FtpResponse> {
    let response = await this.readResponse();

    while (response.preliminary) {
      response = await this.readResponse();
    }

    return response;
  }

  readResponse(): Promise<FtpResponse> {
    const response = this.responses.shift();

    if (response !== undefined) {
      return Promise.resolve(response);
    }

    if (this.closedError !== undefined) {
      return Promise.reject(this.closedError);
    }

    return new Promise((resolve, reject) => {
      this.waiters.push({ reject, resolve });
    });
  }

  close(): void {
    if (!this.socket.destroyed) {
      this.socket.end();
      this.socket.destroy();
    }
  }

  private handleData(chunk: Buffer | string): void {
    try {
      for (const response of this.parser.push(chunk)) {
        this.enqueueResponse(response);
      }
    } catch (error) {
      this.failPending(error instanceof Error ? error : createConnectionError(this.host, error));
    }
  }

  private enqueueResponse(response: FtpResponse): void {
    const waiter = this.waiters.shift();

    if (waiter === undefined) {
      this.responses.push(response);
      return;
    }

    waiter.resolve(response);
  }

  private failPending(error: Error): void {
    if (this.closedError !== undefined) {
      return;
    }

    this.closedError = error;

    for (const waiter of this.waiters.splice(0)) {
      waiter.reject(error);
    }
  }
}

interface PassiveEndpoint {
  host: string;
  port: number;
}

interface PassiveDataConnection {
  ready: Promise<void>;
  data: Promise<Buffer>;
  close(): void;
}

function openPassiveDataConnection(endpoint: PassiveEndpoint): PassiveDataConnection {
  const socket = createConnection({ host: endpoint.host, port: endpoint.port });
  const chunks: Buffer[] = [];
  const ready = new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });
  const data = new Promise<Buffer>((resolve, reject) => {
    socket.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    socket.once("end", () => resolve(Buffer.concat(chunks)));
    socket.once("error", reject);
  });

  return {
    ready,
    data,
    close() {
      void data.catch(() => undefined);
      socket.destroy();
    },
  };
}

function parsePassiveEndpoint(response: FtpResponse): PassiveEndpoint {
  const endpointMatch = /\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/.exec(response.message);

  if (endpointMatch === null) {
    throw createProtocolError(
      "PASV",
      "FTP PASV response did not include a host and port",
      response,
    );
  }

  const [, first, second, third, fourth, highByte, lowByte] = endpointMatch;
  const parts = [first, second, third, fourth, highByte, lowByte].map((part) => Number(part));

  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw createProtocolError(
      "PASV",
      "FTP PASV response included an invalid host or port",
      response,
    );
  }

  return {
    host: `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`,
    port: parts[4]! * 256 + parts[5]!,
  };
}

async function authenticateFtpSession(
  control: FtpControlConnection,
  username: string,
  password: string,
  host: string,
): Promise<void> {
  const safeUsername = assertSafeFtpArgument(username, "username");
  const safePassword = assertSafeFtpArgument(password, "password");
  const userResponse = await control.sendCommand(`USER ${safeUsername}`);

  if (userResponse.completion) {
    return;
  }

  if (!userResponse.intermediate) {
    throw createAuthenticationError(host, "USER", userResponse);
  }

  const passwordResponse = await control.sendCommand(`PASS ${safePassword}`);

  if (!passwordResponse.completion) {
    throw createAuthenticationError(host, "PASS", passwordResponse);
  }
}

function assertPathCommandSucceeded(response: FtpResponse, command: string, path: string): void {
  if (response.completion) {
    return;
  }

  if (response.code === 550) {
    throw new PathNotFoundError({
      command,
      ftpCode: response.code,
      message: `FTP path not found: ${path}`,
      path,
      protocol: FTP_PROVIDER_ID,
      retryable: false,
    });
  }

  throw createProtocolError(command, `FTP command failed: ${command}`, response);
}

function waitForSocketConnect(socket: Socket, options: FtpConnectOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;

    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      options.signal?.removeEventListener("abort", handleAbort);

      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    };
    const rejectOnce = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      socket.destroy();
      reject(error);
    };
    const handleConnect = () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve();
    };
    const handleError = (error: Error) => rejectOnce(createConnectionError(options.host, error));
    const handleAbort = () =>
      rejectOnce(
        new AbortError({
          details: { operation: "connect" },
          host: options.host,
          message: "FTP connection aborted",
          protocol: FTP_PROVIDER_ID,
          retryable: false,
        }),
      );

    socket.once("connect", handleConnect);
    socket.once("error", handleError);

    if (options.signal?.aborted === true) {
      handleAbort();
      return;
    }

    options.signal?.addEventListener("abort", handleAbort, { once: true });

    if (options.timeoutMs !== undefined) {
      timeout = setTimeout(
        () =>
          rejectOnce(
            new TimeoutError({
              details: { timeoutMs: options.timeoutMs },
              host: options.host,
              message: "FTP connection timed out",
              protocol: FTP_PROVIDER_ID,
              retryable: true,
            }),
          ),
        options.timeoutMs,
      );
    }
  });
}

function createAuthenticationError(
  host: string,
  command: string,
  response: FtpResponse,
): AuthenticationError {
  return new AuthenticationError({
    command,
    ftpCode: response.code,
    host,
    message: `FTP authentication failed during ${command}`,
    protocol: FTP_PROVIDER_ID,
    retryable: false,
  });
}

function createConnectionError(host: string, cause: unknown): ConnectionError {
  return new ConnectionError({
    cause,
    host,
    message: "FTP connection failed",
    protocol: FTP_PROVIDER_ID,
    retryable: true,
  });
}

function createProtocolError(
  command: string,
  message: string,
  response: FtpResponse,
): ProtocolError {
  return new ProtocolError({
    command,
    ftpCode: response.code,
    message,
    protocol: FTP_PROVIDER_ID,
    retryable: response.transientFailure,
  });
}

function normalizeFtpPath(path: string): string {
  const normalized = normalizeRemotePath(path);

  if (normalized === "." || normalized === "/") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getParentPath(path: string): string | undefined {
  if (path === "/") {
    return undefined;
  }

  const parentEnd = path.lastIndexOf("/");
  return parentEnd <= 0 ? "/" : path.slice(0, parentEnd);
}

function isFtpFactLine(line: string): boolean {
  return line.includes(";") && line.includes(" ");
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

function secretToString(value: string | Buffer): string {
  return Buffer.isBuffer(value) ? value.toString("utf8") : value;
}
