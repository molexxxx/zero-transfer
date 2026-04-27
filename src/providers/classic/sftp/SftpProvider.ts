/**
 * SSH2-backed SFTP provider.
 *
 * This initial SFTP slice supports password-authenticated sessions plus provider-neutral
 * directory listing and metadata reads. Transfer streaming, host-key policy helpers,
 * and key/agent authentication can layer on this foundation in later slices.
 *
 * @module providers/classic/sftp/SftpProvider
 */
import { Buffer } from "node:buffer";
import { Client } from "ssh2";
import type {
  ClientErrorExtensions,
  ConnectConfig,
  FileEntryWithStats,
  SFTPWrapper,
  Stats,
} from "ssh2";
import type { CapabilitySet } from "../../../core/CapabilitySet";
import type { TransferSession } from "../../../core/TransferSession";
import {
  AbortError,
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  TimeoutError,
  ZeroTransferError,
} from "../../../errors/ZeroTransferError";
import {
  resolveConnectionProfileSecrets,
  type ResolvedConnectionProfile,
} from "../../../profiles/resolveConnectionProfileSecrets";
import type { SecretValue } from "../../../profiles/SecretSource";
import type {
  ConnectionProfile,
  ListOptions,
  RemoteEntry,
  RemoteEntryType,
  RemoteStat,
  StatOptions,
} from "../../../types/public";
import { basenameRemotePath, joinRemotePath, normalizeRemotePath } from "../../../utils/path";
import type { TransferProvider } from "../../Provider";
import type { ProviderFactory } from "../../ProviderFactory";
import type { RemoteFileSystem } from "../../RemoteFileSystem";

const SFTP_PROVIDER_ID = "sftp";
const SFTP_DEFAULT_PORT = 22;
const SFTP_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: SFTP_PROVIDER_ID,
  authentication: ["password"],
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
  metadata: ["accessedAt", "group", "modifiedAt", "owner", "permissions"],
  maxConcurrency: 8,
  notes: ["Initial ssh2-backed SFTP provider with password authentication and metadata reads"],
};

/** Options used to create an SFTP provider factory. */
export interface SftpProviderOptions {
  /** Hash algorithm used before calling ssh2's host verifier, such as `sha256`. */
  hostHash?: ConnectConfig["hostHash"];
  /** Host-key verifier passed directly to ssh2 for advanced callers. */
  hostVerifier?: ConnectConfig["hostVerifier"];
  /** Default SSH handshake timeout in milliseconds when the profile does not provide `timeoutMs`. */
  readyTimeoutMs?: number;
}

/** Raw SFTP session handles exposed for advanced diagnostics. */
export interface SftpRawSession {
  /** Underlying ssh2 client connection. */
  client: Client;
  /** Underlying ssh2 SFTP wrapper. */
  sftp: SFTPWrapper;
}

/**
 * Creates an SFTP provider factory backed by the mature `ssh2` implementation.
 *
 * @param options - Optional ssh2 host-key verifier and timeout defaults.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createSftpProviderFactory(options: SftpProviderOptions = {}): ProviderFactory {
  validateSftpProviderOptions(options);

  return {
    id: SFTP_PROVIDER_ID,
    capabilities: SFTP_PROVIDER_CAPABILITIES,
    create: () => new SftpProvider(options),
  };
}

class SftpProvider implements TransferProvider<SftpTransferSession> {
  readonly id = SFTP_PROVIDER_ID;
  readonly capabilities = SFTP_PROVIDER_CAPABILITIES;

  constructor(private readonly options: SftpProviderOptions) {}

  async connect(profile: ConnectionProfile): Promise<SftpTransferSession> {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const username = requireTextCredential(resolvedProfile.username, "username");
    const password = requireTextCredential(resolvedProfile.password, "password");
    const client = await connectSshClient(resolvedProfile, this.options, username, password);

    try {
      const sftp = await openSftpSession(client, resolvedProfile);
      return new SftpTransferSession(client, sftp);
    } catch (error) {
      client.end();
      throw mapSftpError(error, {
        command: "SFTP",
        host: resolvedProfile.host,
      });
    }
  }
}

class SftpTransferSession implements TransferSession<SftpRawSession> {
  readonly provider = SFTP_PROVIDER_ID;
  readonly capabilities = SFTP_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;

  constructor(
    private readonly client: Client,
    private readonly sftp: SFTPWrapper,
  ) {
    this.client.on("error", noop);
    this.fs = new SftpFileSystem(sftp);
  }

  disconnect(): Promise<void> {
    return Promise.resolve().then(() => {
      this.client.end();
    });
  }

  raw(): SftpRawSession {
    return {
      client: this.client,
      sftp: this.sftp,
    };
  }
}

class SftpFileSystem implements RemoteFileSystem {
  constructor(private readonly sftp: SFTPWrapper) {}

  async list(path: string, options: ListOptions = {}): Promise<RemoteEntry[]> {
    throwIfAborted(options.signal, path, "list");
    const remotePath = normalizeSftpPath(path);

    try {
      const entries = await readSftpDirectory(this.sftp, remotePath);
      return entries
        .filter((entry) => entry.filename !== "." && entry.filename !== "..")
        .map((entry) => mapSftpDirectoryEntry(remotePath, entry))
        .sort(compareEntries);
    } catch (error) {
      throw mapSftpError(error, { command: "READDIR", path: remotePath });
    }
  }

  async stat(path: string, options: StatOptions = {}): Promise<RemoteStat> {
    throwIfAborted(options.signal, path, "stat");
    const remotePath = normalizeSftpPath(path);

    try {
      const stats = await readSftpStats(this.sftp, remotePath);
      return {
        ...mapSftpStats(remotePath, basenameRemotePath(remotePath), stats),
        exists: true,
      };
    } catch (error) {
      throw mapSftpError(error, { command: "LSTAT", path: remotePath });
    }
  }
}

interface SftpErrorContext {
  command: string;
  host?: string;
  path?: string;
}

interface SftpErrorBase {
  cause: unknown;
  command: string;
  host?: string;
  path?: string;
  protocol: "sftp";
  sftpCode?: number;
}

function connectSshClient(
  profile: ResolvedConnectionProfile,
  options: SftpProviderOptions,
  username: string,
  password: string,
): Promise<Client> {
  const client = new Client();
  const config = createConnectConfig(profile, options, username, password);

  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      client.end();
      reject(mapSftpConnectionError(error, profile.host));
    };
    const handleAbort = () => {
      fail(
        new AbortError({
          details: { operation: "connect" },
          host: profile.host,
          message: "SFTP connection was aborted",
          protocol: "sftp",
          retryable: false,
        }),
      );
    };
    const handleReady = () => {
      settled = true;
      cleanup();
      resolve(client);
    };
    const handleTimeout = () => {
      fail(
        new TimeoutError({
          details: { operation: "connect" },
          host: profile.host,
          message: "SFTP connection timed out",
          protocol: "sftp",
          retryable: true,
        }),
      );
    };
    const cleanup = () => {
      client.off("ready", handleReady);
      client.off("error", fail);
      client.off("timeout", handleTimeout);
      profile.signal?.removeEventListener("abort", handleAbort);
    };

    client.once("ready", handleReady);
    client.once("error", fail);
    client.once("timeout", handleTimeout);

    if (profile.signal?.aborted === true) {
      handleAbort();
      return;
    }

    profile.signal?.addEventListener("abort", handleAbort, { once: true });

    try {
      client.connect(config);
    } catch (error) {
      fail(error);
    }
  });
}

function createConnectConfig(
  profile: ResolvedConnectionProfile,
  options: SftpProviderOptions,
  username: string,
  password: string,
): ConnectConfig {
  const config: ConnectConfig = {
    authHandler: ["password"],
    host: profile.host,
    password,
    port: profile.port ?? SFTP_DEFAULT_PORT,
    username,
  };
  const timeoutMs = profile.timeoutMs ?? options.readyTimeoutMs;

  if (timeoutMs !== undefined) {
    config.readyTimeout = timeoutMs;
    config.timeout = timeoutMs;
  }

  if (options.hostHash !== undefined) config.hostHash = options.hostHash;
  if (options.hostVerifier !== undefined) config.hostVerifier = options.hostVerifier;

  return config;
}

function openSftpSession(client: Client, profile: ResolvedConnectionProfile): Promise<SFTPWrapper> {
  return new Promise((resolve, reject) => {
    client.sftp((error, sftp) => {
      if (error !== undefined) {
        reject(
          mapSftpError(error, {
            command: "SFTP",
            host: profile.host,
          }),
        );
        return;
      }

      resolve(sftp);
    });
  });
}

function readSftpDirectory(sftp: SFTPWrapper, path: string): Promise<FileEntryWithStats[]> {
  return new Promise((resolve, reject) => {
    sftp.readdir(path, (error, entries) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve(entries);
    });
  });
}

function readSftpStats(sftp: SFTPWrapper, path: string): Promise<Stats> {
  return new Promise((resolve, reject) => {
    sftp.lstat(path, (error, stats) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve(stats);
    });
  });
}

function mapSftpDirectoryEntry(directory: string, entry: FileEntryWithStats): RemoteEntry {
  return mapSftpStats(joinRemotePath(directory, entry.filename), entry.filename, entry.attrs, {
    longname: entry.longname,
  });
}

function mapSftpStats(
  path: string,
  name: string,
  stats: Stats,
  raw: { longname?: string } = {},
): RemoteEntry {
  const entry: RemoteEntry = {
    group: String(stats.gid),
    name,
    owner: String(stats.uid),
    path,
    permissions: { raw: formatSftpMode(stats.mode) },
    raw: {
      attrs: serializeSftpStats(stats),
      ...raw,
    },
    type: mapSftpEntryType(stats),
  };
  const accessedAt = sftpSecondsToDate(stats.atime);
  const modifiedAt = sftpSecondsToDate(stats.mtime);

  entry.size = stats.size;
  entry.accessedAt = accessedAt;
  entry.modifiedAt = modifiedAt;

  return entry;
}

function mapSftpEntryType(stats: Stats): RemoteEntryType {
  if (stats.isFile()) return "file";
  if (stats.isDirectory()) return "directory";
  if (stats.isSymbolicLink()) return "symlink";
  return "unknown";
}

function serializeSftpStats(stats: Stats): Record<string, number> {
  return {
    atime: stats.atime,
    gid: stats.gid,
    mode: stats.mode,
    mtime: stats.mtime,
    size: stats.size,
    uid: stats.uid,
  };
}

function sftpSecondsToDate(value: number): Date {
  return new Date(value * 1000);
}

function formatSftpMode(mode: number): string {
  return mode.toString(8).padStart(6, "0");
}

function normalizeSftpPath(path: string): string {
  return normalizeRemotePath(path);
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

function requireTextCredential(
  value: SecretValue | undefined,
  field: "password" | "username",
): string {
  if (value === undefined) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP profiles require a ${field}`,
      protocol: "sftp",
      retryable: false,
    });
  }

  const text = Buffer.isBuffer(value) ? value.toString("utf8") : value;

  if (text.length === 0) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP profile ${field} must be non-empty`,
      protocol: "sftp",
      retryable: false,
    });
  }

  return text;
}

function validateSftpProviderOptions(options: SftpProviderOptions): void {
  if (
    options.readyTimeoutMs !== undefined &&
    (!Number.isFinite(options.readyTimeoutMs) || options.readyTimeoutMs <= 0)
  ) {
    throw new ConfigurationError({
      details: { readyTimeoutMs: options.readyTimeoutMs },
      message: "SFTP provider readyTimeoutMs must be a positive finite number",
      protocol: "sftp",
      retryable: false,
    });
  }
}

function throwIfAborted(
  signal: AbortSignal | undefined,
  path: string,
  operation: "list" | "stat",
): void {
  if (signal?.aborted !== true) {
    return;
  }

  throw new AbortError({
    details: { operation },
    message: `SFTP ${operation} was aborted`,
    path,
    protocol: "sftp",
    retryable: false,
  });
}

function mapSftpConnectionError(error: unknown, host: string): ZeroTransferError {
  if (error instanceof ZeroTransferError) {
    return error;
  }

  if (isSftpAuthenticationError(error)) {
    return new AuthenticationError({
      cause: error,
      host,
      message: "SFTP authentication failed",
      protocol: "sftp",
      retryable: false,
    });
  }

  return new ConnectionError({
    cause: error,
    details: { originalMessage: getErrorMessage(error) },
    host,
    message: `SFTP connection failed: ${getErrorMessage(error)}`,
    protocol: "sftp",
    retryable: true,
  });
}

function mapSftpError(error: unknown, context: SftpErrorContext): ZeroTransferError {
  if (error instanceof ZeroTransferError) {
    return error;
  }

  const sftpCode = getSftpStatusCode(error);
  const baseDetails = createSftpErrorBase(error, context, sftpCode);

  if (sftpCode === 2 || isMissingPathMessage(error)) {
    return new PathNotFoundError({
      ...baseDetails,
      message: `SFTP path not found: ${context.path ?? "unknown"}`,
      retryable: false,
    });
  }

  if (sftpCode === 3) {
    return new PermissionDeniedError({
      ...baseDetails,
      message: `SFTP permission denied: ${context.path ?? context.command}`,
      retryable: false,
      sftpCode,
    });
  }

  return new ProtocolError({
    ...baseDetails,
    details: { originalMessage: getErrorMessage(error) },
    message: `SFTP ${context.command} failed: ${getErrorMessage(error)}`,
    retryable: sftpCode === 6 || sftpCode === 7,
  });
}

function createSftpErrorBase(
  error: unknown,
  context: SftpErrorContext,
  sftpCode: number | undefined,
): SftpErrorBase {
  const base: SftpErrorBase = {
    cause: error,
    command: context.command,
    protocol: "sftp",
  };

  if (context.host !== undefined) base.host = context.host;
  if (context.path !== undefined) base.path = context.path;
  if (sftpCode !== undefined) base.sftpCode = sftpCode;

  return base;
}

function getSftpStatusCode(error: unknown): number | undefined {
  const code = isRecord(error) ? error.code : undefined;

  if (typeof code === "number") {
    return code;
  }

  return undefined;
}

function isSftpAuthenticationError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  const level = (error as ClientErrorExtensions).level;
  const message = getErrorMessage(error).toLowerCase();

  return level === "client-authentication" || message.includes("authentication");
}

function isMissingPathMessage(error: unknown): boolean {
  return /no such file|not found/i.test(getErrorMessage(error));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function noop(): void {}
