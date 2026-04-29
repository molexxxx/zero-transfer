/**
 * Classic FTP and FTPS providers backed by MLST/MLSD metadata commands.
 * @module providers/classic/ftp/FtpProvider
 */
import { Buffer } from "node:buffer";
import { createConnection, isIP, type Socket } from "node:net";
import {
  connect as connectTls,
  type ConnectionOptions as TlsConnectionOptions,
  type PeerCertificate,
  type TLSSocket,
} from "node:tls";
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
} from "../../../errors/ZeroTransferError";
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
import type {
  ConnectionProfile,
  MkdirOptions,
  RemoteEntry,
  RemoteStat,
  RemoveOptions,
  RmdirOptions,
} from "../../../types/public";
import {
  assertSafeFtpArgument,
  basenameRemotePath,
  normalizeRemotePath,
} from "../../../utils/path";
import { parseMlsdLine, parseMlsdList, parseUnixList } from "./FtpListParser";
import { FtpResponseParser, type FtpResponse } from "./FtpResponseParser";

const FTP_PROVIDER_ID = "ftp";
const FTPS_PROVIDER_ID = "ftps";
const DEFAULT_FTP_PORT = 21;
const DEFAULT_FTPS_IMPLICIT_PORT = 990;
const DEFAULT_PASSIVE_HOST_STRATEGY: FtpPassiveHostStrategy = "control";

const FTP_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTP_PROVIDER_ID, [
  "Classic FTP provider foundation with MLST/MLSD metadata, EPSV/PASV passive mode, timeout-guarded operations, and RETR/STOR streaming support",
]);

const FTPS_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTPS_PROVIDER_ID, [
  "FTPS provider foundation with explicit AUTH TLS or implicit TLS, PBSZ/PROT setup, TLS profile support, MLST/MLSD metadata, EPSV/PASV passive mode, and RETR/STOR streaming support",
]);

/**
 * Builds the shared classic-provider capability snapshot for FTP-family providers.
 *
 * @param provider - Provider id represented by the capability snapshot.
 * @param notes - Human-readable caveats exposed through capability discovery.
 * @returns Provider capabilities advertised before and after connection.
 */
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

/** Internal configuration used to instantiate an FTP-family provider implementation. */
interface ClassicFtpProviderConfig {
  /** Provider id exposed by the created provider and sessions. */
  providerId: ClassicProviderId;
  /** Capability snapshot associated with this provider variant. */
  capabilities: CapabilitySet;
  /** Control-channel port used when the profile omits one. */
  defaultPort: number;
  /** Host selection strategy used for PASV data endpoints. */
  passiveHostStrategy: FtpPassiveHostStrategy;
  /** Optional FTPS negotiation settings. Omitted for plain FTP. */
  security?: FtpsSecurityConfig;
}

/** FTPS-specific security settings derived from provider factory options. */
interface FtpsSecurityConfig {
  /** Control-channel TLS mode for the connection. */
  mode: FtpsMode;
  /** Data-channel protection level requested through PROT. */
  dataProtection: FtpsDataProtection;
}

/**
 * FTPS control-channel TLS mode.
 *
 * `explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
 * `implicit` starts TLS immediately, typically on port 990.
 */
export type FtpsMode = "explicit" | "implicit";

/**
 * FTPS data-channel protection level requested after TLS negotiation.
 *
 * `private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
 * `PROT C`, keeping the control channel encrypted while leaving data sockets plain.
 */
export type FtpsDataProtection = "clear" | "private";

/**
 * Host selection strategy for PASV data endpoints.
 *
 * `control` connects data sockets back to the control connection host, which avoids
 * broken private or unroutable PASV addresses from NATed servers. `advertised` uses
 * the host supplied by the server's PASV response for deployments that require it.
 */
export type FtpPassiveHostStrategy = "advertised" | "control";

/** Options used to create the classic FTP provider factory. */
export interface FtpProviderOptions {
  /** Default control port used when a connection profile omits `port`. */
  defaultPort?: number;
  /** PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. */
  passiveHostStrategy?: FtpPassiveHostStrategy;
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
 *
 * @example Plain FTP (cleartext — prefer FTPS or SFTP whenever possible)
 * ```ts
 * import { createFtpProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createFtpProviderFactory()] });
 *
 * const session = await client.connect({
 *   host: "ftp.example.com",
 *   provider: "ftp",
 *   username: "deploy",
 *   password: { env: "FTP_PASSWORD" },
 * });
 * ```
 */
export function createFtpProviderFactory(options: FtpProviderOptions = {}): ProviderFactory {
  return {
    id: FTP_PROVIDER_ID,
    capabilities: FTP_PROVIDER_CAPABILITIES,
    create: () =>
      new FtpProvider({
        capabilities: FTP_PROVIDER_CAPABILITIES,
        defaultPort: options.defaultPort ?? DEFAULT_FTP_PORT,
        passiveHostStrategy: options.passiveHostStrategy ?? DEFAULT_PASSIVE_HOST_STRATEGY,
        providerId: FTP_PROVIDER_ID,
      }),
  };
}

/**
 * Creates a provider factory for explicit or implicit FTPS connections.
 *
 * The factory resolves TLS material from each connection profile, upgrades explicit
 * sessions with `AUTH TLS`, and applies the configured `PROT` data-channel policy.
 *
 * @param options - Optional provider defaults.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example FTPS with public-CA TLS (no extra TLS material needed)
 * ```ts
 * import { createFtpsProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createFtpsProviderFactory()] });
 *
 * const session = await client.connect({
 *   host: "ftps.example.com",
 *   provider: "ftps",
 *   username: "deploy",
 *   password: { env: "FTPS_PASSWORD" },
 *   tls: { minVersion: "TLSv1.2" },
 * });
 * ```
 *
 * @example FTPS with private CA + certificate pinning (defence-in-depth)
 * ```ts
 * await client.connect({
 *   host: "ftps.internal.example",
 *   provider: "ftps",
 *   username: "audit",
 *   tls: {
 *     ca: { path: "./certs/ca-bundle.pem" },
 *     cert: { path: "./certs/client.crt" },
 *     key: { path: "./certs/client.key" },
 *     // Optional but recommended:
 *     pinnedFingerprint256: "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
 *   },
 * });
 * ```
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
        passiveHostStrategy: options.passiveHostStrategy ?? DEFAULT_PASSIVE_HOST_STRATEGY,
        providerId: FTPS_PROVIDER_ID,
        security: {
          dataProtection: options.dataProtection ?? "private",
          mode,
        },
      }),
  };
}

/** Provider implementation shared by plain FTP and FTPS factory variants. */
class FtpProvider implements TransferProvider {
  /** Stable provider id registered in the transfer client. */
  readonly id: ClassicProviderId;
  /** Provider capability snapshot exposed without opening a connection. */
  readonly capabilities: CapabilitySet;

  /**
   * Creates a provider instance for a single connection attempt.
   *
   * @param config - Provider id, defaults, capabilities, and optional FTPS settings.
   */
  constructor(private readonly config: ClassicFtpProviderConfig) {
    this.id = config.providerId;
    this.capabilities = config.capabilities;
  }

  /**
   * Opens an FTP-family transfer session from a provider-neutral connection profile.
   *
   * @param profile - Connection profile containing host, credentials, timeout, and optional TLS settings.
   * @returns Connected transfer session with filesystem and transfer operations.
   */
  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const port = resolvedProfile.port ?? this.config.defaultPort;
    const connectOptions: FtpConnectOptions = {
      host: resolvedProfile.host,
      passiveHostStrategy: this.config.passiveHostStrategy,
      port,
      providerId: this.config.providerId,
    };

    if (this.config.security !== undefined) {
      const pinnedFingerprint256 = createTlsPinnedFingerprints(resolvedProfile);

      connectOptions.security = {
        ...this.config.security,
        ...(pinnedFingerprint256 === undefined ? {} : { pinnedFingerprint256 }),
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

/** Transfer session backed by one FTP-family control connection. */
class FtpTransferSession implements TransferSession {
  /** Provider id selected for this session. */
  readonly provider: ClassicProviderId;
  /** Capability snapshot for this connected session. */
  readonly capabilities: CapabilitySet;
  /** Remote file-system operations backed by FTP metadata/data commands. */
  readonly fs: RemoteFileSystem;
  /** Stream-oriented provider transfer operations. */
  readonly transfers: ProviderTransferOperations;

  /**
   * Creates session facades over an authenticated control connection.
   *
   * @param control - Authenticated FTP-family control connection.
   * @param capabilities - Capability snapshot to expose through the session.
   */
  constructor(
    private readonly control: FtpControlConnection,
    capabilities: CapabilitySet,
  ) {
    this.provider = control.providerId;
    this.capabilities = capabilities;
    this.fs = new FtpFileSystem(control);
    this.transfers = new FtpTransferOperations(control);
  }

  /** Disconnects the control connection, swallowing QUIT cleanup noise. */
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
    const entries = await readDirectoryEntries(this.control, remotePath);
    return entries.sort(compareEntries);
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

  async remove(path: string, options: RemoveOptions = {}): Promise<void> {
    const remotePath = normalizeFtpPath(path);
    const response = await this.control.sendCommand(`DELE ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550 && options.ignoreMissing) return;
    assertPathCommandSucceeded(response, "DELE", remotePath, this.control.providerId);
  }

  async rename(from: string, to: string): Promise<void> {
    const fromPath = normalizeFtpPath(from);
    const toPath = normalizeFtpPath(to);
    const rnfr = await this.control.sendCommand(`RNFR ${fromPath}`);
    if (!rnfr.intermediate && !rnfr.completion) {
      assertPathCommandSucceeded(rnfr, "RNFR", fromPath, this.control.providerId);
    }
    await expectCompletion(this.control, `RNTO ${toPath}`, toPath);
  }

  async mkdir(path: string, options: MkdirOptions = {}): Promise<void> {
    const remotePath = normalizeFtpPath(path);
    if (!options.recursive) {
      await expectCompletion(this.control, `MKD ${remotePath}`, remotePath);
      return;
    }
    const segments = remotePath.split("/").filter((s) => s.length > 0);
    let current = "";
    for (const segment of segments) {
      current = `${current}/${segment}`;
      const response = await this.control.sendCommand(`MKD ${current}`);
      if (response.completion) continue;
      // 550 here is typically "directory already exists" — tolerated for recursive create.
      if (response.code === 550) continue;
      assertPathCommandSucceeded(response, "MKD", current, this.control.providerId);
    }
  }

  async rmdir(path: string, options: RmdirOptions = {}): Promise<void> {
    const remotePath = normalizeFtpPath(path);
    if (options.recursive) {
      await this.removeDirectoryRecursive(remotePath);
      return;
    }
    const response = await this.control.sendCommand(`RMD ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550 && options.ignoreMissing) return;
    assertPathCommandSucceeded(response, "RMD", remotePath, this.control.providerId);
  }

  private async removeDirectoryRecursive(remotePath: string): Promise<void> {
    let entries: RemoteEntry[];
    try {
      entries = await readDirectoryEntries(this.control, remotePath);
    } catch (error) {
      // Treat a missing directory as already removed.
      if (error instanceof PathNotFoundError) return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.name === "." || entry.name === "..") continue;
      const childPath = entry.path.startsWith("/")
        ? entry.path
        : normalizeFtpPath(`${remotePath.replace(/\/+$/, "")}/${entry.name}`);
      if (entry.type === "directory") {
        await this.removeDirectoryRecursive(childPath);
      } else {
        const del = await this.control.sendCommand(`DELE ${childPath}`);
        if (!del.completion && del.code !== 550) {
          assertPathCommandSucceeded(del, "DELE", childPath, this.control.providerId);
        }
      }
    }
    const response = await this.control.sendCommand(`RMD ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550) return;
    assertPathCommandSucceeded(response, "RMD", remotePath, this.control.providerId);
  }
}

/** Socket-level connection settings used by the FTP-family control connection. */
interface FtpConnectOptions {
  /** Remote control endpoint host. */
  host: string;
  /** Host selection strategy used for PASV data endpoints. */
  passiveHostStrategy: FtpPassiveHostStrategy;
  /** Remote control endpoint port. */
  port: number;
  /** Provider id used in errors and session metadata. */
  providerId: ClassicProviderId;
  /** Optional FTPS negotiation settings. */
  security?: FtpConnectSecurity;
  /** Abort signal used during initial socket setup. */
  signal?: AbortSignal;
  /** Operation timeout applied to connection and control reads. */
  timeoutMs?: number;
}

/** Resolved FTPS settings including Node TLS connection options. */
interface FtpConnectSecurity extends FtpsSecurityConfig {
  /** TLS options derived from the resolved connection profile. */
  tlsOptions: TlsConnectionOptions;
  /** Normalized SHA-256 certificate fingerprints accepted for server pinning. */
  pinnedFingerprint256?: readonly string[];
}

/** Pending control-response reader waiting for the next parsed FTP reply. */
interface ResponseWaiter {
  /** Resolves the waiter with the next parsed response. */
  resolve(response: FtpResponse): void;
  /** Rejects the waiter when the control connection fails. */
  reject(error: Error): void;
}

/** Context used to create timeout diagnostics for control and data operations. */
interface FtpTimeoutContext {
  /** Human-readable operation phase, such as `greeting` or `passive data transfer`. */
  operation: string;
  /** FTP command associated with the wait, when one exists. */
  command?: string;
  /** Remote path associated with the operation, when one exists. */
  path?: string;
}

/** Stateful FTP-family control connection with optional explicit TLS upgrade support. */
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

  /**
   * Creates a control connection around an already-open socket.
   *
   * @param socket - Plain TCP or TLS socket connected to the server.
   * @param host - Host used for diagnostics and passive endpoint defaults.
   * @param passiveHostStrategy - Host selection strategy for PASV data endpoints.
   * @param providerId - Provider id used for errors and sessions.
   * @param timeoutMs - Optional timeout applied to control reads.
   * @param security - Optional FTPS settings, omitted for plain FTP.
   */
  private constructor(
    socket: Socket,
    private readonly host: string,
    private readonly passiveHostStrategy: FtpPassiveHostStrategy,
    readonly providerId: ClassicProviderId,
    private readonly timeoutMs: number | undefined,
    private readonly security: FtpConnectSecurity | undefined,
  ) {
    this.socket = socket;
    this.attachSocket(socket);
  }

  /** Host used for EPSV passive data connections. */
  get passiveHost(): string {
    return this.host;
  }

  /** Host selection strategy used for PASV data endpoints. */
  get passiveEndpointHostStrategy(): FtpPassiveHostStrategy {
    return this.passiveHostStrategy;
  }

  /** Timeout inherited by command waits and passive data operations. */
  get operationTimeoutMs(): number | undefined {
    return this.timeoutMs;
  }

  /** FTPS security settings for encrypted passive data sockets. */
  get dataTlsSecurity(): FtpConnectSecurity | undefined {
    return this.security?.dataProtection === "private" ? this.security : undefined;
  }

  /**
   * Opens a new control connection, reads the greeting, and negotiates FTPS when configured.
   *
   * @param options - Socket and provider connection options.
   * @returns Connected control connection ready for authentication.
   */
  static async connect(options: FtpConnectOptions): Promise<FtpControlConnection> {
    const socket = createControlSocket(options);
    const control = new FtpControlConnection(
      socket,
      options.host,
      options.passiveHostStrategy,
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

      if (options.security?.mode === "implicit") {
        assertPinnedTlsCertificate(socket, options.security, options.host, options.providerId);
      }

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
      } else if (options.security?.mode === "implicit") {
        await configureFtpsProtection(control, options.security);
      }

      return control;
    } catch (error) {
      control.close();
      throw error;
    }
  }

  /**
   * Writes one raw FTP command line to the control socket.
   *
   * @param command - Command text without CRLF.
   */
  writeCommand(command: string): void {
    this.socket.write(`${command}\r\n`);
  }

  /**
   * Sends a command and waits for the final non-preliminary response.
   *
   * @param command - Command text without CRLF.
   * @returns Final FTP response for the command.
   */
  async sendCommand(command: string): Promise<FtpResponse> {
    this.writeCommand(command);
    return this.readFinalResponse({ command, operation: "command response" });
  }

  /**
   * Reads responses until a final response is reached.
   *
   * @param context - Timeout diagnostic context for the wait.
   * @returns Final FTP response, skipping any preliminary 1xx replies.
   */
  async readFinalResponse(
    context: FtpTimeoutContext = { operation: "response" },
  ): Promise<FtpResponse> {
    let response = await this.readResponse(context);

    while (response.preliminary) {
      response = await this.readResponse(context);
    }

    return response;
  }

  /**
   * Reads the next parsed control-channel response.
   *
   * @param context - Timeout diagnostic context for the wait.
   * @returns Next parsed response from the control channel.
   */
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

  /** Closes the current control socket. */
  close(): void {
    if (!this.socket.destroyed) {
      this.socket.end();
      this.socket.destroy();
    }
  }

  /**
   * Upgrades an explicit-FTPS control connection from plain TCP to TLS.
   *
   * @param security - Resolved FTPS security settings and TLS options.
   */
  async upgradeToTls(security: FtpConnectSecurity): Promise<void> {
    const plainSocket = this.socket;
    this.detachSocket(plainSocket);
    const tlsSocket = connectTls({ ...security.tlsOptions, socket: plainSocket });

    this.socket = tlsSocket;
    this.attachSocket(tlsSocket);

    const connectOptions: FtpConnectOptions = {
      host: this.host,
      passiveHostStrategy: this.passiveHostStrategy,
      port: 0,
      providerId: this.providerId,
    };

    if (this.timeoutMs !== undefined) {
      connectOptions.timeoutMs = this.timeoutMs;
    }

    await waitForSocketConnect(tlsSocket, connectOptions, "secureConnect", "TLS negotiation");
    assertPinnedTlsCertificate(tlsSocket, security, this.host, this.providerId);
  }

  /**
   * Attaches shared parser and failure handlers to the active control socket.
   *
   * @param socket - Socket that should feed control-channel responses.
   */
  private attachSocket(socket: Socket): void {
    socket.on("data", this.handleSocketData);
    socket.on("error", this.handleSocketError);
    socket.on("close", this.handleSocketClose);
  }

  /**
   * Detaches shared parser and failure handlers before replacing a control socket.
   *
   * @param socket - Socket being removed from the control connection.
   */
  private detachSocket(socket: Socket): void {
    socket.off("data", this.handleSocketData);
    socket.off("error", this.handleSocketError);
    socket.off("close", this.handleSocketClose);
  }

  /**
   * Parses inbound control-channel bytes into queued responses.
   *
   * @param chunk - Socket data chunk from the control channel.
   */
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

  /**
   * Delivers a parsed response to a waiter or queues it for the next read.
   *
   * @param response - Parsed FTP response.
   */
  private enqueueResponse(response: FtpResponse): void {
    const waiter = this.waiters.shift();

    if (waiter === undefined) {
      this.responses.push(response);
      return;
    }

    waiter.resolve(response);
  }

  /**
   * Fails outstanding waits and records the first terminal connection error.
   *
   * @param error - Error that closed or invalidated the control connection.
   */
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

/** Host and port returned by EPSV or PASV negotiation. */
interface PassiveEndpoint {
  /** Data socket host to connect to. */
  host: string;
  /** Data socket port to connect to. */
  port: number;
}

/** Passive data connection opened before issuing a transfer command. */
interface PassiveDataConnection {
  /** Endpoint used for diagnostics and timeout errors. */
  endpoint: PassiveEndpoint;
  /** Resolves when the data socket is connected and ready. */
  ready: Promise<void>;
  /** Plain or TLS data socket for the transfer. */
  socket: Socket;
  /** Closes the data socket. */
  close(): void;
}

/** Transfer options applied before opening the passive data command. */
interface PassiveTransferOptions {
  /** Restart offset sent via REST before the data command. */
  offset?: number;
}

/** Normalized byte range requested for a provider read operation. */
interface ResolvedReadRange {
  /** Starting byte offset. */
  offset: number;
  /** Maximum number of bytes to emit, when bounded. */
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

/**
 * Reads directory entries with MLSD first and Unix LIST as an unsupported-command fallback.
 *
 * @param control - Active FTP-family control connection.
 * @param path - Normalized remote directory path.
 * @returns Parsed remote directory entries.
 */
async function readDirectoryEntries(
  control: FtpControlConnection,
  path: string,
): Promise<RemoteEntry[]> {
  try {
    const payload = await readPassiveDataCommand(control, `MLSD ${path}`, path);
    return parseMlsdList(payload.toString("utf8"), path);
  } catch (error) {
    if (!isUnsupportedFtpCommandError(error, "MLSD")) {
      throw error;
    }
  }

  const payload = await readPassiveDataCommand(control, `LIST ${path}`, path);
  return parseUnixList(payload.toString("utf8"), path);
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
  return parsePassiveEndpoint(
    passiveResponse,
    control.passiveHost,
    control.passiveEndpointHostStrategy,
    control.providerId,
  );
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

/**
 * Opens a passive data socket, using TLS when FTPS data protection is private.
 *
 * @param endpoint - Passive endpoint advertised by EPSV or PASV.
 * @param timeoutMs - Optional timeout for the data socket connection.
 * @param path - Remote path associated with the transfer for diagnostics.
 * @param control - Control connection that owns provider id and TLS settings.
 * @returns Passive data connection wrapper with a readiness promise.
 */
function openPassiveDataConnection(
  endpoint: PassiveEndpoint,
  timeoutMs: number | undefined,
  path: string,
  control: FtpControlConnection,
): PassiveDataConnection {
  const dataSecurity = control.dataTlsSecurity;
  const socket =
    dataSecurity === undefined
      ? createConnection({ host: endpoint.host, port: endpoint.port })
      : connectTls({ ...dataSecurity.tlsOptions, host: endpoint.host, port: endpoint.port });
  socket.on("error", () => undefined);
  const ready = new Promise<void>((resolve, reject) => {
    let settled = false;
    let timeout: NodeJS.Timeout | undefined;
    const readyEvent = dataSecurity === undefined ? "connect" : "secureConnect";

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

      try {
        if (dataSecurity !== undefined) {
          assertPinnedTlsCertificate(socket, dataSecurity, endpoint.host, control.providerId);
        }

        settled = true;
        cleanup();
        resolve();
      } catch (error) {
        rejectOnce(
          error instanceof Error
            ? error
            : createConnectionError(endpoint.host, error, control.providerId),
        );
      }
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

/**
 * Parses a PASV response into a concrete data endpoint.
 *
 * @param response - Successful PASV response from the server.
 * @param controlHost - Host used by the control connection.
 * @param hostStrategy - Strategy used to choose the passive data endpoint host.
 * @param providerId - Provider id used in protocol diagnostics.
 * @returns Host and port for the passive data socket.
 */
function parsePassiveEndpoint(
  response: FtpResponse,
  controlHost: string,
  hostStrategy: FtpPassiveHostStrategy,
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

  const advertisedHost = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`;

  return {
    host: hostStrategy === "advertised" ? advertisedHost : controlHost,
    port: parts[4]! * 256 + parts[5]!,
  };
}

/**
 * Parses an EPSV response into a data endpoint using the control host.
 *
 * @param response - Successful EPSV response from the server.
 * @param host - Host from the control connection.
 * @param providerId - Provider id used in protocol diagnostics.
 * @returns Host and port for the passive data socket.
 */
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

/**
 * Checks whether an EPSV response should fall back to PASV.
 *
 * @param response - Final response from the EPSV command.
 * @returns `true` when the server reports EPSV as unsupported.
 */
function isExtendedPassiveUnsupported(response: FtpResponse): boolean {
  return (
    response.code === 500 ||
    response.code === 501 ||
    response.code === 502 ||
    response.code === 504 ||
    response.code === 522
  );
}

/**
 * Checks whether an FTP command failed with an unsupported-command response.
 *
 * @param error - Error thrown while waiting for a command response.
 * @param commandName - FTP command name that may be unsupported.
 * @returns `true` when the server rejected the command as unavailable.
 */
function isUnsupportedFtpCommandError(error: unknown, commandName: string): boolean {
  return (
    error instanceof ProtocolError &&
    error.command?.startsWith(commandName) === true &&
    isUnsupportedFtpCommandCode(error.ftpCode)
  );
}

/**
 * Checks whether an FTP status code usually means a command is unsupported.
 *
 * @param code - FTP status code from a failed command.
 * @returns `true` for permanent unsupported-command responses.
 */
function isUnsupportedFtpCommandCode(code: number | undefined): boolean {
  return code === 500 || code === 501 || code === 502 || code === 504;
}

/**
 * Creates the initial control socket for plain FTP, explicit FTPS, or implicit FTPS.
 *
 * @param options - Connection options including FTPS mode and TLS settings.
 * @returns Connected socket instance in progress; callers wait for the appropriate ready event.
 */
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

/**
 * Performs explicit FTPS negotiation on a connected plain control socket.
 *
 * @param control - Control connection that has received a successful server greeting.
 * @param security - Resolved FTPS mode and data-channel protection settings.
 * @returns A promise that resolves after AUTH TLS, PBSZ, and PROT setup complete.
 */
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

  await control.upgradeToTls(security);
  await configureFtpsProtection(control, security);
}

/**
 * Configures FTPS buffer size and data-channel protection for an encrypted control session.
 *
 * @param control - TLS-protected FTPS control connection.
 * @param security - Resolved FTPS data-channel protection settings.
 * @returns A promise that resolves after PBSZ and PROT commands complete.
 */
async function configureFtpsProtection(
  control: FtpControlConnection,
  security: FtpConnectSecurity,
): Promise<void> {
  await expectCompletion(control, "PBSZ 0", "/");
  await expectCompletion(control, security.dataProtection === "private" ? "PROT P" : "PROT C", "/");
}

/**
 * Converts a resolved connection profile into Node TLS connection options.
 *
 * @param profile - Connection profile with credential and TLS secrets already resolved.
 * @returns TLS options for control and protected data sockets.
 */
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

/**
 * Normalizes SHA-256 certificate pinning values from a resolved profile.
 *
 * @param profile - Connection profile with TLS policy fields already resolved.
 * @returns Normalized lowercase fingerprint pins, or `undefined` when no pins are configured.
 */
function createTlsPinnedFingerprints(
  profile: ResolvedConnectionProfile,
): readonly string[] | undefined {
  const pinnedFingerprint256 = profile.tls?.pinnedFingerprint256;

  if (pinnedFingerprint256 === undefined) {
    return undefined;
  }

  const fingerprints = Array.isArray(pinnedFingerprint256)
    ? pinnedFingerprint256
    : [pinnedFingerprint256];

  if (fingerprints.length === 0) {
    throw new ConfigurationError({
      details: { pinnedFingerprint256 },
      message: "FTPS tls.pinnedFingerprint256 must include at least one SHA-256 fingerprint",
      protocol: FTPS_PROVIDER_ID,
      retryable: false,
    });
  }

  return fingerprints.map(normalizePinnedFingerprint256);
}

/**
 * Normalizes one SHA-256 certificate fingerprint pin.
 *
 * @param fingerprint - Fingerprint string using hex with optional colon separators.
 * @returns Lowercase hex fingerprint without separators.
 * @throws {@link ConfigurationError} When the fingerprint is not valid SHA-256 hex.
 */
function normalizePinnedFingerprint256(fingerprint: string): string {
  const normalized = fingerprint.trim().replace(/:/g, "").toLowerCase();

  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new ConfigurationError({
      details: { pinnedFingerprint256: fingerprint },
      message: "FTPS tls.pinnedFingerprint256 must be a SHA-256 hex fingerprint",
      protocol: FTPS_PROVIDER_ID,
      retryable: false,
    });
  }

  return normalized;
}

/**
 * Verifies a TLS peer certificate against configured SHA-256 pins.
 *
 * @param socket - TLS socket with a completed handshake.
 * @param security - FTPS security settings containing normalized certificate pins.
 * @param host - Host used for connection diagnostics.
 * @param providerId - Provider id used for typed connection errors.
 * @throws {@link ConnectionError} When the server certificate fingerprint is not pinned.
 */
function assertPinnedTlsCertificate(
  socket: Socket,
  security: FtpConnectSecurity,
  host: string,
  providerId: ClassicProviderId,
): void {
  const pinnedFingerprint256 = security.pinnedFingerprint256;

  if (pinnedFingerprint256 === undefined) {
    return;
  }

  if (!isTlsSocket(socket)) {
    throw createConnectionError(
      host,
      new Error("FTPS certificate pinning requires a TLS socket"),
      providerId,
    );
  }

  const certificate = socket.getPeerCertificate();
  const actualFingerprint = normalizeCertificateFingerprint256(certificate);

  if (pinnedFingerprint256.includes(actualFingerprint)) {
    return;
  }

  throw createConnectionError(
    host,
    new Error("FTPS server certificate SHA-256 fingerprint did not match tls.pinnedFingerprint256"),
    providerId,
  );
}

/**
 * Checks whether a socket exposes TLS peer-certificate inspection.
 *
 * @param socket - Socket created for a control or data connection.
 * @returns `true` when the socket is a TLS socket.
 */
function isTlsSocket(socket: Socket): socket is TLSSocket {
  return typeof (socket as Partial<TLSSocket>).getPeerCertificate === "function";
}

/**
 * Normalizes the SHA-256 fingerprint reported by a TLS peer certificate.
 *
 * @param certificate - Peer certificate returned by Node's TLS socket APIs.
 * @returns Lowercase SHA-256 hex fingerprint without separators.
 */
function normalizeCertificateFingerprint256(certificate: PeerCertificate): string {
  return certificate.fingerprint256.replace(/:/g, "").toLowerCase();
}

/**
 * Clones resolved TLS material into the shape expected by Node TLS APIs.
 *
 * @param value - Resolved single TLS value or ordered CA bundle array.
 * @returns String, Buffer, or array accepted by `tls.connect()`.
 */
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
