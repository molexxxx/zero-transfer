/**
 * Classic FTP provider backed by MLST/MLSD metadata commands.
 *
 * @module providers/classic/ftp/FtpProvider
 */
import { Buffer } from "node:buffer";
import { createConnection, isIP, type Socket } from "node:net";
import { connect as connectTls, type ConnectionOptions as TlsConnectionOptions } from "node:tls";
import type { CapabilitySet } from "../../../core/CapabilitySet";
import type { ClassicProviderId } from "../../../core/ProviderId";
import type { TransferSession } from "../../../core/TransferSession";
import {
  AbortError,
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  ProtocolError,
  TimeoutError,
} from "../../../errors/ZeroFTPError";
import {
  resolveConnectionProfileSecrets,
  type ResolvedConnectionProfile,
  type ResolvedTlsProfile,
} from "../../../profiles/resolveConnectionProfileSecrets";
import type { TransferVerificationResult } from "../../../transfers/TransferJob";
import type { ProviderFactory } from "../../ProviderFactory";
import type { TransferProvider } from "../../Provider";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../../ProviderTransferOperations";
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
const FTPS_PROVIDER_ID = "ftps";
const DEFAULT_FTP_PORT = 21;
const DEFAULT_FTPS_IMPLICIT_PORT = 990;

const FTP_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTP_PROVIDER_ID, [
  "Classic FTP provider foundation with MLST/MLSD metadata, EPSV/PASV passive mode, timeout-guarded operations, and RETR/STOR streaming support",
]);

const FTPS_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTPS_PROVIDER_ID, [
  "Explicit FTPS provider foundation with AUTH TLS, PBSZ/PROT setup, TLS profile support, MLST/MLSD metadata, EPSV/PASV passive mode, and RETR/STOR streaming support",
]);

function createClassicFtpCapabilities(provider: ClassicProviderId, notes: string[]): CapabilitySet {
  return {
    provider,
    authentication:
      provider === FTPS_PROVIDER_ID
        ? ["anonymous", "password", "client-certificate"]
        : ["anonymous", "password"],
    list: true,
    stat: true,
    readStream: true,
    writeStream: true,
    serverSideCopy: false,
    serverSideMove: false,
    resumeDownload: true,
    resumeUpload: true,
    checksum: [],
    atomicRename: false,
    chmod: false,
    chown: false,
    symlink: true,
    metadata: ["modifiedAt", "permissions", "uniqueId"],
    maxConcurrency: 1,
    notes,
  };
}

interface ClassicFtpProviderConfig {
  providerId: ClassicProviderId;
  capabilities: CapabilitySet;
  defaultPort: number;
  security?: FtpsSecurityConfig;
}

interface FtpsSecurityConfig {
  mode: FtpsMode;
  dataProtection: FtpsDataProtection;
}

/** FTPS control-channel TLS mode. */
export type FtpsMode = "explicit" | "implicit";

/** FTPS data-channel protection level requested after TLS negotiation. */
export type FtpsDataProtection = "clear" | "private";

/** Options used to create the classic FTP provider factory. */
export interface FtpProviderOptions {
  /** Default control port used when a connection profile omits `port`. */
  defaultPort?: number;
}

/** Options used to create the FTPS provider factory. */
export interface FtpsProviderOptions extends FtpProviderOptions {
  /** TLS mode used for the control connection. Defaults to explicit FTPS on port 21. */
  mode?: FtpsMode;
  /** Data channel protection requested through PROT. Defaults to private/encrypted data. */
  dataProtection?: FtpsDataProtection;
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
    create: () =>
      new FtpProvider({
        capabilities: FTP_PROVIDER_CAPABILITIES,
        defaultPort: options.defaultPort ?? DEFAULT_FTP_PORT,
        providerId: FTP_PROVIDER_ID,
      }),
  };
}

/**
 * Creates a provider factory for explicit or implicit FTPS connections.
 *
 * @param options - Optional provider defaults.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createFtpsProviderFactory(options: FtpsProviderOptions = {}): ProviderFactory {
  const mode = options.mode ?? "explicit";
  const defaultPort =
    options.defaultPort ?? (mode === "implicit" ? DEFAULT_FTPS_IMPLICIT_PORT : DEFAULT_FTP_PORT);

  return {
    id: FTPS_PROVIDER_ID,
    capabilities: FTPS_PROVIDER_CAPABILITIES,
    create: () =>
      new FtpProvider({
        capabilities: FTPS_PROVIDER_CAPABILITIES,
        defaultPort,
        providerId: FTPS_PROVIDER_ID,
        security: {
          dataProtection: options.dataProtection ?? "private",
          mode,
        },
      }),
  };
}

class FtpProvider implements TransferProvider {
  readonly id: ClassicProviderId;
  readonly capabilities: CapabilitySet;

  constructor(private readonly config: ClassicFtpProviderConfig) {
    this.id = config.providerId;
    this.capabilities = config.capabilities;
  }

  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const port = resolvedProfile.port ?? this.config.defaultPort;
    const connectOptions: FtpConnectOptions = {
      host: resolvedProfile.host,
      port,
      providerId: this.config.providerId,
    };

    if (this.config.security !== undefined) {
      connectOptions.security = {
        ...this.config.security,
        tlsOptions: createTlsConnectionOptions(resolvedProfile),
      };
    }

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
      return new FtpTransferSession(control, this.capabilities);
    } catch (error) {
      control.close();
      throw error;
    }
  }
}

class FtpTransferSession implements TransferSession {
  readonly provider: ClassicProviderId;
  readonly capabilities: CapabilitySet;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(
    private readonly control: FtpControlConnection,
    capabilities: CapabilitySet,
  ) {
    this.provider = control.providerId;
    this.capabilities = capabilities;
    this.fs = new FtpFileSystem(control);
    this.transfers = new FtpTransferOperations(control);
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

class FtpTransferOperations implements ProviderTransferOperations {
  constructor(private readonly control: FtpControlConnection) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const remotePath = normalizeFtpPath(request.endpoint.path);
    const range = resolveReadRange(request.range);

    await expectCompletion(this.control, "TYPE I", remotePath);
    const dataConnection = await openPassiveDataCommand(
      this.control,
      `RETR ${remotePath}`,
      remotePath,
      {
        offset: range.offset,
      },
    );
    request.throwIfAborted();
    const result: ProviderTransferReadResult = {
      content: createPassiveReadSource(
        this.control,
        dataConnection,
        `RETR ${remotePath}`,
        remotePath,
        range,
        request,
      ),
    };

    if (range.length !== undefined) {
      result.totalBytes = range.length;
    }

    if (range.offset > 0) {
      result.bytesRead = range.offset;
    }

    return result;
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const remotePath = normalizeFtpPath(request.endpoint.path);
    const offset = normalizeOptionalByteCount(request.offset, "offset", remotePath);

    await expectCompletion(this.control, "TYPE I", remotePath);
    const bytesTransferred = await writePassiveDataCommand(
      this.control,
      `STOR ${remotePath}`,
      remotePath,
      request,
      offset === undefined ? {} : { offset },
    );

    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      resumed: offset !== undefined && offset > 0,
      totalBytes: request.totalBytes ?? (offset ?? 0) + bytesTransferred,
      verified: request.verification?.verified ?? false,
    };

    if (request.verification !== undefined) {
      result.verification = cloneVerification(request.verification);
    }

    return result;
  }
}

class FtpFileSystem implements RemoteFileSystem {
  constructor(private readonly control: FtpControlConnection) {}

  async list(path: string): Promise<RemoteEntry[]> {
    const remotePath = normalizeFtpPath(path);
    await expectCompletion(this.control, "TYPE I", remotePath);
    const payload = await readPassiveDataCommand(this.control, `MLSD ${remotePath}`, remotePath);
    return parseMlsdList(payload.toString("utf8"), remotePath).sort(compareEntries);
  }

  async stat(path: string): Promise<RemoteStat> {
    const remotePath = normalizeFtpPath(path);
    const response = await this.control.sendCommand(`MLST ${remotePath}`);
    assertPathCommandSucceeded(response, "MLST", remotePath, this.control.providerId);

    const factLine = response.lines.map((line) => line.trim()).find(isFtpFactLine);

    if (factLine === undefined) {
      throw createProtocolError(
        "MLST",
        `${this.control.providerId.toUpperCase()} MLST response did not include a fact line`,
        response,
        this.control.providerId,
      );
    }

    const entry = parseMlsdLine(factLine, getParentPath(remotePath) ?? "/");

    return {
      ...entry,
      exists: true,
      name: basenameRemotePath(remotePath),
      path: remotePath,
    };
  }
}

interface FtpConnectOptions {
  host: string;
  port: number;
  providerId: ClassicProviderId;
  security?: FtpConnectSecurity;
  signal?: AbortSignal;
  timeoutMs?: number;
}

interface FtpConnectSecurity extends FtpsSecurityConfig {
  tlsOptions: TlsConnectionOptions;
}

interface ResponseWaiter {
  resolve(response: FtpResponse): void;
  reject(error: Error): void;
}

interface FtpTimeoutContext {
  operation: string;
  command?: string;
  path?: string;
}

class FtpControlConnection {
  private readonly parser = new FtpResponseParser();
  private readonly responses: FtpResponse[] = [];
  private readonly waiters: ResponseWaiter[] = [];
  private closedError: Error | undefined;
  private socket: Socket;

  private readonly handleSocketData = (chunk: Buffer | string) => this.handleData(chunk);
  private readonly handleSocketError = (error: Error) => {
    this.failPending(createConnectionError(this.host, error, this.providerId));
  };
  private readonly handleSocketClose = () => {
    this.failPending(
      new ConnectionError({
        host: this.host,
        message: `${this.providerId.toUpperCase()} control connection closed`,
        protocol: this.providerId,
        retryable: true,
      }),
    );
  };

  private constructor(
    socket: Socket,
    private readonly host: string,
    readonly providerId: ClassicProviderId,
    private readonly timeoutMs: number | undefined,
    private readonly security: FtpConnectSecurity | undefined,
  ) {
    this.socket = socket;
    this.attachSocket(socket);
  }

  get passiveHost(): string {
    return this.host;
  }

  get operationTimeoutMs(): number | undefined {
    return this.timeoutMs;
  }

  get dataTlsOptions(): TlsConnectionOptions | undefined {
    return this.security?.dataProtection === "private" ? this.security.tlsOptions : undefined;
  }

  static async connect(options: FtpConnectOptions): Promise<FtpControlConnection> {
    const socket = createControlSocket(options);
    const control = new FtpControlConnection(
      socket,
      options.host,
      options.providerId,
      options.timeoutMs,
      options.security,
    );

    try {
      await waitForSocketConnect(
        socket,
        options,
        options.security?.mode === "implicit" ? "secureConnect" : "connect",
      );
      const greeting = await control.readFinalResponse({ operation: "greeting" });

      if (!greeting.completion) {
        throw createProtocolError(
          "greeting",
          `${options.providerId.toUpperCase()} server greeting was not successful`,
          greeting,
          options.providerId,
        );
      }

      if (options.security?.mode === "explicit") {
        await negotiateExplicitFtps(control, options.security);
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
    return this.readFinalResponse({ command, operation: "command response" });
  }

  async readFinalResponse(
    context: FtpTimeoutContext = { operation: "response" },
  ): Promise<FtpResponse> {
    let response = await this.readResponse(context);

    while (response.preliminary) {
      response = await this.readResponse(context);
    }

    return response;
  }

  readResponse(context: FtpTimeoutContext = { operation: "response" }): Promise<FtpResponse> {
    const response = this.responses.shift();

    if (response !== undefined) {
      return Promise.resolve(response);
    }

    if (this.closedError !== undefined) {
      return Promise.reject(this.closedError);
    }

    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timeout | undefined;
      const clearWaiterTimeout = () => {
        if (timeout !== undefined) {
          clearTimeout(timeout);
        }
      };
      const waiter: ResponseWaiter = {
        reject(error) {
          clearWaiterTimeout();
          reject(error);
        },
        resolve(response) {
          clearWaiterTimeout();
          resolve(response);
        },
      };

      this.waiters.push(waiter);

      const timeoutMs = this.timeoutMs;

      if (timeoutMs !== undefined) {
        timeout = setTimeout(() => {
          const error = createFtpTimeoutError({
            ...context,
            host: this.host,
            providerId: this.providerId,
            timeoutMs,
          });

          this.failPending(error);
          this.close();
        }, timeoutMs);
      }
    });
  }

  close(): void {
    if (!this.socket.destroyed) {
      this.socket.end();
      this.socket.destroy();
    }
  }

  async upgradeToTls(tlsOptions: TlsConnectionOptions): Promise<void> {
    const plainSocket = this.socket;
    this.detachSocket(plainSocket);
    const tlsSocket = connectTls({ ...tlsOptions, socket: plainSocket });

    this.socket = tlsSocket;
    this.attachSocket(tlsSocket);

    const connectOptions: FtpConnectOptions = {
      host: this.host,
      port: 0,
      providerId: this.providerId,
    };

    if (this.timeoutMs !== undefined) {
      connectOptions.timeoutMs = this.timeoutMs;
    }

    await waitForSocketConnect(tlsSocket, connectOptions, "secureConnect", "TLS negotiation");
  }

  private attachSocket(socket: Socket): void {
    socket.on("data", this.handleSocketData);
    socket.on("error", this.handleSocketError);
    socket.on("close", this.handleSocketClose);
  }

  private detachSocket(socket: Socket): void {
    socket.off("data", this.handleSocketData);
    socket.off("error", this.handleSocketError);
    socket.off("close", this.handleSocketClose);
  }

  private handleData(chunk: Buffer | string): void {
    try {
      for (const response of this.parser.push(chunk)) {
        this.enqueueResponse(response);
      }
    } catch (error) {
      this.failPending(
        error instanceof Error ? error : createConnectionError(this.host, error, this.providerId),
      );
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
  endpoint: PassiveEndpoint;
  ready: Promise<void>;
  socket: Socket;
  close(): void;
}

interface PassiveTransferOptions {
  offset?: number;
}

interface ResolvedReadRange {
  offset: number;
  length?: number;
}

async function expectCompletion(
  control: FtpControlConnection,
  command: string,
  path: string,
): Promise<void> {
  const response = await control.sendCommand(command);
  assertPathCommandSucceeded(response, command, path, control.providerId);
}

async function readPassiveDataCommand(
  control: FtpControlConnection,
  command: string,
  path: string,
  options: PassiveTransferOptions = {},
): Promise<Buffer> {
  const dataConnection = await openPassiveDataCommand(control, command, path, options);

  try {
    const payload = await collectPassiveData(
      dataConnection,
      control.operationTimeoutMs,
      path,
      control.providerId,
    );
    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path,
    });
    assertPathCommandSucceeded(finalResponse, command, path, control.providerId);
    return payload;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}

async function openPassiveDataCommand(
  control: FtpControlConnection,
  command: string,
  path: string,
  options: PassiveTransferOptions = {},
): Promise<PassiveDataConnection> {
  const offset = normalizeOptionalByteCount(options.offset, "offset", path);

  if (offset !== undefined && offset > 0) {
    await sendRestartOffset(control, offset, path);
  }

  const passiveEndpoint = await openPassiveEndpoint(control, path);
  const dataConnection = openPassiveDataConnection(
    passiveEndpoint,
    control.operationTimeoutMs,
    path,
    control,
  );

  try {
    await dataConnection.ready;
    control.writeCommand(command);
    const initialResponse = await control.readResponse({
      command,
      operation: "data command response",
      path,
    });

    if (!initialResponse.preliminary) {
      dataConnection.close();
      assertPathCommandSucceeded(initialResponse, command, path, control.providerId);
      throw createProtocolError(
        command,
        `${control.providerId.toUpperCase()} data command did not open a data transfer`,
        initialResponse,
        control.providerId,
      );
    }

    return dataConnection;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}

async function openPassiveEndpoint(
  control: FtpControlConnection,
  path: string,
): Promise<PassiveEndpoint> {
  const extendedPassiveResponse = await control.sendCommand("EPSV");

  if (extendedPassiveResponse.completion) {
    return parseExtendedPassiveEndpoint(
      extendedPassiveResponse,
      control.passiveHost,
      control.providerId,
    );
  }

  if (!isExtendedPassiveUnsupported(extendedPassiveResponse)) {
    assertPathCommandSucceeded(extendedPassiveResponse, "EPSV", path, control.providerId);
  }

  const passiveResponse = await control.sendCommand("PASV");
  assertPathCommandSucceeded(passiveResponse, "PASV", path, control.providerId);
  return parsePassiveEndpoint(passiveResponse, control.providerId);
}

async function writePassiveDataCommand(
  control: FtpControlConnection,
  command: string,
  path: string,
  request: ProviderTransferWriteRequest,
  options: PassiveTransferOptions = {},
): Promise<number> {
  const dataConnection = await openPassiveDataCommand(control, command, path, options);
  let bytesTransferred = 0;
  const timeoutContext = {
    host: dataConnection.endpoint.host,
    operation: "passive data transfer",
    path,
    providerId: control.providerId,
  };

  try {
    for await (const chunk of request.content) {
      request.throwIfAborted();
      const output = new Uint8Array(chunk);
      await writeSocketChunk(
        dataConnection.socket,
        output,
        control.operationTimeoutMs,
        timeoutContext,
      );
      bytesTransferred += output.byteLength;
      request.reportProgress(bytesTransferred, request.totalBytes);
    }

    await endSocket(dataConnection.socket, control.operationTimeoutMs, timeoutContext);
    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path,
    });
    assertPathCommandSucceeded(finalResponse, command, path, control.providerId);
    return bytesTransferred;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}

async function sendRestartOffset(
  control: FtpControlConnection,
  offset: number,
  path: string,
): Promise<void> {
  const response = await control.sendCommand(`REST ${offset}`);

  if (response.completion || response.intermediate) {
    return;
  }

  assertPathCommandSucceeded(response, "REST", path, control.providerId);
}

function openPassiveDataConnection(
  endpoint: PassiveEndpoint,
  timeoutMs: number | undefined,
  path: string,
  control: FtpControlConnection,
): PassiveDataConnection {
  const tlsOptions = control.dataTlsOptions;
  const socket =
    tlsOptions === undefined
      ? createConnection({ host: endpoint.host, port: endpoint.port })
      : connectTls({ ...tlsOptions, host: endpoint.host, port: endpoint.port });
  socket.on("error", () => undefined);
  const ready = new Promise<void>((resolve, reject) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;
    const readyEvent = tlsOptions === undefined ? "connect" : "secureConnect";

    const cleanup = () => {
      socket.off(readyEvent, handleConnect);
      socket.off("error", handleError);

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
    const handleError = (error: Error) => {
      rejectOnce(
        error instanceof TimeoutError
          ? error
          : createConnectionError(endpoint.host, error, control.providerId),
      );
    };

    socket.once(readyEvent, handleConnect);
    socket.once("error", handleError);

    if (timeoutMs !== undefined) {
      timeout = setTimeout(
        () =>
          rejectOnce(
            createFtpTimeoutError({
              host: endpoint.host,
              operation: "passive data connection",
              path,
              providerId: control.providerId,
              timeoutMs,
            }),
          ),
        timeoutMs,
      );
    }
  });

  return {
    endpoint,
    ready,
    socket,
    close() {
      socket.destroy();
    },
  };
}

async function collectPassiveData(
  dataConnection: PassiveDataConnection,
  timeoutMs: number | undefined,
  path: string,
  providerId: ClassicProviderId,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const clearIdleTimeout = setSocketTimeout(dataConnection.socket, timeoutMs, {
    host: dataConnection.endpoint.host,
    operation: "passive data transfer",
    path,
    providerId,
  });

  try {
    for await (const chunk of dataConnection.socket as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
  } finally {
    clearIdleTimeout();
  }

  return Buffer.concat(chunks);
}

async function* createPassiveReadSource(
  control: FtpControlConnection,
  dataConnection: PassiveDataConnection,
  command: string,
  path: string,
  range: ResolvedReadRange,
  request: ProviderTransferReadRequest,
): AsyncGenerator<Uint8Array> {
  let bytesEmitted = 0;
  let completed = false;
  let clearIdleTimeout: () => void = () => undefined;
  const closeOnAbort = () => dataConnection.close();

  request.signal?.addEventListener("abort", closeOnAbort, { once: true });

  try {
    clearIdleTimeout = setSocketTimeout(dataConnection.socket, control.operationTimeoutMs, {
      host: dataConnection.endpoint.host,
      operation: "passive data transfer",
      path,
      providerId: control.providerId,
    });

    for await (const chunk of dataConnection.socket as AsyncIterable<Buffer>) {
      request.throwIfAborted();
      const buffer = Buffer.from(chunk);

      if (range.length === undefined) {
        bytesEmitted += buffer.byteLength;
        yield new Uint8Array(buffer);
        continue;
      }

      const remaining = range.length - bytesEmitted;

      if (remaining <= 0) {
        continue;
      }

      const output = buffer.subarray(0, Math.min(remaining, buffer.byteLength));
      bytesEmitted += output.byteLength;

      if (output.byteLength > 0) {
        yield new Uint8Array(output);
      }
    }

    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path,
    });
    assertPathCommandSucceeded(finalResponse, command, path, control.providerId);
    completed = true;
  } finally {
    clearIdleTimeout();
    request.signal?.removeEventListener("abort", closeOnAbort);

    if (!completed) {
      dataConnection.close();
    }
  }
}

function writeSocketChunk(
  socket: Socket,
  chunk: Uint8Array,
  timeoutMs: number | undefined,
  context: Omit<FtpTimeoutErrorInput, "timeoutMs">,
): Promise<void> {
  if (chunk.byteLength === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const clearIdleTimeout = setSocketTimeout(socket, timeoutMs, context);
    const handleError = (error: Error) => {
      clearIdleTimeout();
      socket.off("error", handleError);
      reject(error);
    };

    socket.once("error", handleError);
    socket.write(chunk, (error?: Error | null) => {
      clearIdleTimeout();
      socket.off("error", handleError);

      if (error != null) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function endSocket(
  socket: Socket,
  timeoutMs: number | undefined,
  context: Omit<FtpTimeoutErrorInput, "timeoutMs">,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const clearIdleTimeout = setSocketTimeout(socket, timeoutMs, context);
    const handleError = (error: Error) => {
      clearIdleTimeout();
      socket.off("error", handleError);
      reject(error);
    };

    socket.once("error", handleError);
    socket.end(() => {
      clearIdleTimeout();
      socket.off("error", handleError);
      resolve();
    });
  });
}

function resolveReadRange(range: ProviderTransferReadRequest["range"]): ResolvedReadRange {
  if (range === undefined) {
    return { offset: 0 };
  }

  const resolved: ResolvedReadRange = {
    offset: normalizeByteCount(range.offset, "offset", "/"),
  };

  if (range.length !== undefined) {
    resolved.length = normalizeByteCount(range.length, "length", "/");
  }

  return resolved;
}

function normalizeOptionalByteCount(
  value: number | undefined,
  field: string,
  path: string,
): number | undefined {
  return value === undefined ? undefined : normalizeByteCount(value, field, path);
}

function normalizeByteCount(value: number, field: string, path: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field, provider: FTP_PROVIDER_ID },
      message: `FTP provider ${field} must be a non-negative number`,
      path,
      protocol: FTP_PROVIDER_ID,
      retryable: false,
    });
  }

  return Math.floor(value);
}

function cloneVerification(verification: TransferVerificationResult): TransferVerificationResult {
  const clone: TransferVerificationResult = { verified: verification.verified };

  if (verification.method !== undefined) clone.method = verification.method;
  if (verification.checksum !== undefined) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== undefined) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== undefined) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== undefined) clone.details = { ...verification.details };

  return clone;
}

function parsePassiveEndpoint(
  response: FtpResponse,
  providerId: ClassicProviderId,
): PassiveEndpoint {
  const endpointMatch = /(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/.exec(response.message);

  if (endpointMatch === null) {
    throw createProtocolError(
      "PASV",
      `${providerId.toUpperCase()} PASV response did not include a host and port`,
      response,
      providerId,
    );
  }

  const [, first, second, third, fourth, highByte, lowByte] = endpointMatch;
  const parts = [first, second, third, fourth, highByte, lowByte].map((part) => Number(part));

  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw createProtocolError(
      "PASV",
      `${providerId.toUpperCase()} PASV response included an invalid host or port`,
      response,
      providerId,
    );
  }

  return {
    host: `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`,
    port: parts[4]! * 256 + parts[5]!,
  };
}

function parseExtendedPassiveEndpoint(
  response: FtpResponse,
  host: string,
  providerId: ClassicProviderId,
): PassiveEndpoint {
  const endpointMatch = /\((.+)\)/.exec(response.message);

  if (endpointMatch === null) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response did not include a port`,
      response,
      providerId,
    );
  }

  const endpointText = endpointMatch[1] ?? "";
  const delimiter = endpointText[0];

  if (delimiter === undefined) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response did not include a delimiter`,
      response,
      providerId,
    );
  }

  const parts = endpointText.split(delimiter);
  const port = Number(parts[3]);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response included an invalid port`,
      response,
      providerId,
    );
  }

  return { host, port };
}

function isExtendedPassiveUnsupported(response: FtpResponse): boolean {
  return (
    response.code === 500 ||
    response.code === 501 ||
    response.code === 502 ||
    response.code === 504 ||
    response.code === 522
  );
}

function createControlSocket(options: FtpConnectOptions): Socket {
  if (options.security?.mode === "implicit") {
    return connectTls({
      ...options.security.tlsOptions,
      host: options.host,
      port: options.port,
    });
  }

  return createConnection({ host: options.host, port: options.port });
}

async function negotiateExplicitFtps(
  control: FtpControlConnection,
  security: FtpConnectSecurity,
): Promise<void> {
  const authResponse = await control.sendCommand("AUTH TLS");

  if (!authResponse.completion) {
    throw createProtocolError(
      "AUTH TLS",
      "FTPS AUTH TLS negotiation failed",
      authResponse,
      control.providerId,
    );
  }

  await control.upgradeToTls(security.tlsOptions);
  await expectCompletion(control, "PBSZ 0", "/");
  await expectCompletion(control, security.dataProtection === "private" ? "PROT P" : "PROT C", "/");
}

function createTlsConnectionOptions(profile: ResolvedConnectionProfile): TlsConnectionOptions {
  const tlsProfile = profile.tls;
  const options: TlsConnectionOptions = {
    rejectUnauthorized: tlsProfile?.rejectUnauthorized ?? true,
  };
  const servername =
    tlsProfile?.servername ?? (isIP(profile.host) === 0 ? profile.host : undefined);

  if (servername !== undefined) {
    options.servername = servername;
  }

  if (tlsProfile === undefined) {
    return options;
  }

  if (tlsProfile.ca !== undefined) options.ca = normalizeTlsSecretValue(tlsProfile.ca);
  if (tlsProfile.cert !== undefined) options.cert = normalizeTlsSecretValue(tlsProfile.cert);
  if (tlsProfile.key !== undefined) options.key = normalizeTlsSecretValue(tlsProfile.key);
  if (tlsProfile.pfx !== undefined) options.pfx = normalizeTlsSecretValue(tlsProfile.pfx);
  if (tlsProfile.passphrase !== undefined)
    options.passphrase = secretToString(tlsProfile.passphrase);
  if (tlsProfile.minVersion !== undefined) options.minVersion = tlsProfile.minVersion;
  if (tlsProfile.maxVersion !== undefined) options.maxVersion = tlsProfile.maxVersion;
  if (tlsProfile.checkServerIdentity !== undefined) {
    options.checkServerIdentity = tlsProfile.checkServerIdentity;
  }

  return options;
}

function normalizeTlsSecretValue(
  value: NonNullable<ResolvedTlsProfile["ca"]> | NonNullable<ResolvedTlsProfile["cert"]>,
): string | Buffer | Array<string | Buffer> {
  if (Array.isArray(value)) {
    return value.map((item) => (Buffer.isBuffer(item) ? Buffer.from(item) : item));
  }

  return Buffer.isBuffer(value) ? Buffer.from(value) : value;
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
    throw createAuthenticationError(host, "USER", userResponse, control.providerId);
  }

  const passwordResponse = await control.sendCommand(`PASS ${safePassword}`);

  if (!passwordResponse.completion) {
    throw createAuthenticationError(host, "PASS", passwordResponse, control.providerId);
  }
}

function assertPathCommandSucceeded(
  response: FtpResponse,
  command: string,
  path: string,
  providerId: ClassicProviderId,
): void {
  if (response.completion) {
    return;
  }

  if (response.code === 550) {
    throw new PathNotFoundError({
      command,
      ftpCode: response.code,
      message: `${providerId.toUpperCase()} path not found: ${path}`,
      path,
      protocol: providerId,
      retryable: false,
    });
  }

  throw createProtocolError(
    command,
    `${providerId.toUpperCase()} command failed: ${command}`,
    response,
    providerId,
  );
}

function waitForSocketConnect(
  socket: Socket,
  options: FtpConnectOptions,
  readyEvent: "connect" | "secureConnect" = "connect",
  operation = "connection",
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;

    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off(readyEvent, handleConnect);
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
    const handleError = (error: Error) =>
      rejectOnce(createConnectionError(options.host, error, options.providerId));
    const handleAbort = () =>
      rejectOnce(
        new AbortError({
          details: { operation },
          host: options.host,
          message: `${options.providerId.toUpperCase()} ${operation} aborted`,
          protocol: options.providerId,
          retryable: false,
        }),
      );

    socket.once(readyEvent, handleConnect);
    socket.once("error", handleError);

    if (options.signal?.aborted === true) {
      handleAbort();
      return;
    }

    options.signal?.addEventListener("abort", handleAbort, { once: true });

    const timeoutMs = options.timeoutMs;

    if (timeoutMs !== undefined) {
      timeout = setTimeout(
        () =>
          rejectOnce(
            createFtpTimeoutError({
              host: options.host,
              operation,
              providerId: options.providerId,
              timeoutMs,
            }),
          ),
        timeoutMs,
      );
    }
  });
}

interface FtpTimeoutErrorInput extends FtpTimeoutContext {
  host: string;
  providerId: ClassicProviderId;
  timeoutMs: number;
}

function createFtpTimeoutError(input: FtpTimeoutErrorInput): TimeoutError {
  const details: Record<string, unknown> = {
    operation: input.operation,
    timeoutMs: input.timeoutMs,
  };

  return new TimeoutError({
    details,
    host: input.host,
    message: `${input.providerId.toUpperCase()} ${input.operation} timed out after ${input.timeoutMs}ms`,
    protocol: input.providerId,
    retryable: true,
    ...(input.command === undefined ? {} : { command: input.command }),
    ...(input.path === undefined ? {} : { path: input.path }),
  });
}

function setSocketTimeout(
  socket: Socket,
  timeoutMs: number | undefined,
  context: Omit<FtpTimeoutErrorInput, "timeoutMs">,
): () => void {
  if (timeoutMs === undefined) {
    return () => undefined;
  }

  const handleTimeout = () => {
    socket.destroy(createFtpTimeoutError({ ...context, timeoutMs }));
  };

  socket.setTimeout(timeoutMs);
  socket.once("timeout", handleTimeout);

  return () => {
    socket.off("timeout", handleTimeout);
    socket.setTimeout(0);
  };
}

function createAuthenticationError(
  host: string,
  command: string,
  response: FtpResponse,
  providerId: ClassicProviderId,
): AuthenticationError {
  return new AuthenticationError({
    command,
    ftpCode: response.code,
    host,
    message: `${providerId.toUpperCase()} authentication failed during ${command}`,
    protocol: providerId,
    retryable: false,
  });
}

function createConnectionError(
  host: string,
  cause: unknown,
  providerId: ClassicProviderId,
): ConnectionError {
  return new ConnectionError({
    cause,
    host,
    message: `${providerId.toUpperCase()} connection failed`,
    protocol: providerId,
    retryable: true,
  });
}

function createProtocolError(
  command: string,
  message: string,
  response: FtpResponse,
  providerId: ClassicProviderId,
): ProtocolError {
  return new ProtocolError({
    command,
    ftpCode: response.code,
    message,
    protocol: providerId,
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
