/**
 * SSH2-backed SFTP provider.
 *
 * This initial SFTP slice supports password/private-key/agent authenticated sessions, custom sockets,
 * provider-neutral directory listing, metadata reads, transfer streaming, and profile-level host-key policies.
 *
 * @module providers/classic/sftp/SftpProvider
 */
import { Buffer } from "node:buffer";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Client, utils } from "ssh2";
import type {
  AnyAuthMethod,
  ClientErrorExtensions,
  ConnectConfig,
  FileEntryWithStats,
  KeyboardInteractiveCallback,
  ParsedKey,
  ReadStream,
  SFTPWrapper,
  Stats,
  WriteStream,
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
import type { TransferVerificationResult } from "../../../transfers/TransferJob";
import type {
  ConnectionProfile,
  ListOptions,
  RemoteEntry,
  RemoteEntryType,
  RemoteStat,
  SshKeyboardInteractiveChallenge,
  StatOptions,
} from "../../../types/public";
import { basenameRemotePath, joinRemotePath, normalizeRemotePath } from "../../../utils/path";
import type { TransferProvider } from "../../Provider";
import type { ProviderFactory } from "../../ProviderFactory";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../../ProviderTransferOperations";
import type { RemoteFileSystem } from "../../RemoteFileSystem";

const SFTP_PROVIDER_ID = "sftp";
const SFTP_DEFAULT_PORT = 22;
const SFTP_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: SFTP_PROVIDER_ID,
  authentication: ["password", "private-key", "agent", "keyboard-interactive"],
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
  metadata: ["accessedAt", "group", "modifiedAt", "owner", "permissions"],
  maxConcurrency: 8,
  notes: [
    "Initial ssh2-backed SFTP provider with password/private-key/agent authentication, metadata reads, and transfer streams",
  ],
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
 *
 * @example Register and use
 * ```ts
 * import { createSftpProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createSftpProviderFactory()] });
 *
 * const session = await client.connect({
 *   host: "sftp.example.com",
 *   provider: "sftp",
 *   username: "deploy",
 *   ssh: {
 *     privateKey: { path: "./keys/id_ed25519" },
 *     // Optional but recommended for production:
 *     pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
 *   },
 * });
 * ```
 *
 * Host-key verification (`ssh.knownHosts` and/or `ssh.pinnedHostKeySha256`) is
 * optional; without either, the client trusts whatever host key the server
 * presents. Use one for any non-lab deployment.
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
    const authentication = resolveSftpAuthentication(resolvedProfile);
    const client = await connectSshClient(resolvedProfile, this.options, username, authentication);

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
  readonly transfers: ProviderTransferOperations;

  constructor(
    private readonly client: Client,
    private readonly sftp: SFTPWrapper,
  ) {
    this.client.on("error", noop);
    this.fs = new SftpFileSystem(sftp);
    this.transfers = new SftpTransferOperations(sftp);
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

class SftpTransferOperations implements ProviderTransferOperations {
  constructor(private readonly sftp: SFTPWrapper) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const remotePath = normalizeSftpPath(request.endpoint.path);

    try {
      const stats = await readSftpStats(this.sftp, remotePath);

      if (!stats.isFile()) {
        throw createSftpPathNotFoundError(remotePath, `SFTP path is not a file: ${remotePath}`);
      }

      const range = resolveSftpReadRange(stats.size, request.range);
      const result: ProviderTransferReadResult = {
        content: createSftpReadSource(this.sftp, remotePath, range, request),
        totalBytes: range.length,
      };

      if (range.offset > 0) {
        result.bytesRead = range.offset;
      }

      return result;
    } catch (error) {
      throw mapSftpError(error, { command: "READ", path: remotePath });
    }
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const remotePath = normalizeSftpPath(request.endpoint.path);
    const offset = normalizeOptionalByteCount(request.offset, "offset", remotePath);

    try {
      const bytesTransferred = await writeSftpContent(this.sftp, remotePath, request, offset);
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
    } catch (error) {
      throw mapSftpError(error, { command: "WRITE", path: remotePath });
    }
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

interface SftpAuthenticationConfig {
  authHandler: NonNullable<ConnectConfig["authHandler"]>;
}

interface SftpKnownHostEntry {
  key: ParsedKey;
  patterns: string[];
}

interface SftpHostKeyPolicy {
  host: string;
  knownHosts?: SftpKnownHostEntry[];
  pinnedHostKeySha256?: Set<string>;
  port: number;
}

type ResolvedSshKnownHosts = NonNullable<ResolvedConnectionProfile["ssh"]>["knownHosts"];
type ResolvedSshHostKeyPins = NonNullable<ResolvedConnectionProfile["ssh"]>["pinnedHostKeySha256"];

interface ResolvedSftpReadRange {
  offset: number;
  length: number;
}

async function connectSshClient(
  profile: ResolvedConnectionProfile,
  options: SftpProviderOptions,
  username: string,
  authentication: SftpAuthenticationConfig,
): Promise<Client> {
  const client = new Client();
  let config: ConnectConfig;

  try {
    config = await createConnectConfig(profile, options, username, authentication);
  } catch (error) {
    client.end();
    throw mapSftpConnectionError(error, profile.host);
  }

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

async function createConnectConfig(
  profile: ResolvedConnectionProfile,
  options: SftpProviderOptions,
  username: string,
  authentication: SftpAuthenticationConfig,
): Promise<ConnectConfig> {
  const config: ConnectConfig = {
    authHandler: authentication.authHandler,
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT,
    username,
  };
  const timeoutMs = profile.timeoutMs ?? options.readyTimeoutMs;

  if (timeoutMs !== undefined) {
    config.readyTimeout = timeoutMs;
    config.timeout = timeoutMs;
  }

  if (profile.ssh?.algorithms !== undefined) {
    config.algorithms = profile.ssh.algorithms;
  }

  const socket = await createSftpSocket(profile, username);

  if (socket !== undefined) {
    config.sock = socket;
  }

  configureSftpHostKeyVerifier(config, profile, options);

  return config;
}

/**
 * Resolves an optional profile-provided SSH socket before connecting.
 *
 * @param profile - Resolved connection profile containing the optional socket factory.
 * @param username - Resolved username passed to the factory context.
 * @returns Socket-like readable stream for ssh2's `sock` option, when configured.
 */
async function createSftpSocket(
  profile: ResolvedConnectionProfile,
  username: string,
): Promise<ConnectConfig["sock"]> {
  const socketFactory = profile.ssh?.socketFactory;

  if (socketFactory === undefined) {
    return undefined;
  }

  if (profile.signal?.aborted === true) {
    throw new AbortError({
      details: { operation: "connect" },
      host: profile.host,
      message: "SFTP connection was aborted",
      protocol: "sftp",
      retryable: false,
    });
  }

  const context = {
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT,
    username,
  };

  const socket = await socketFactory(
    profile.signal === undefined ? context : { ...context, signal: profile.signal },
  );

  if (typeof socket !== "object" || socket === null || typeof socket.pipe !== "function") {
    throw new ConfigurationError({
      details: { socket: typeof socket },
      message: "Connection profile ssh.socketFactory must return a socket-like readable stream",
      protocol: "sftp",
      retryable: false,
    });
  }

  return socket;
}

function configureSftpHostKeyVerifier(
  config: ConnectConfig,
  profile: ResolvedConnectionProfile,
  options: SftpProviderOptions,
): void {
  const policy = createSftpHostKeyPolicy(profile);

  if (policy === undefined) {
    if (options.hostHash !== undefined) config.hostHash = options.hostHash;
    if (options.hostVerifier !== undefined) config.hostVerifier = options.hostVerifier;
    return;
  }

  if (options.hostHash !== undefined || options.hostVerifier !== undefined) {
    throw new ConfigurationError({
      details: { provider: SFTP_PROVIDER_ID },
      message:
        "SFTP profile host-key policies cannot be combined with provider-level hostHash or hostVerifier options",
      protocol: "sftp",
      retryable: false,
    });
  }

  config.hostVerifier = (key: Buffer) => verifySftpHostKey(policy, key);
}

function createSftpHostKeyPolicy(
  profile: ResolvedConnectionProfile,
): SftpHostKeyPolicy | undefined {
  const knownHosts = parseKnownHosts(profile.ssh?.knownHosts);
  const pins = normalizeHostKeyPins(profile.ssh?.pinnedHostKeySha256);

  if (knownHosts === undefined && pins === undefined) {
    return undefined;
  }

  const policy: SftpHostKeyPolicy = {
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT,
  };

  if (knownHosts !== undefined) policy.knownHosts = knownHosts;
  if (pins !== undefined) policy.pinnedHostKeySha256 = pins;

  return policy;
}

function verifySftpHostKey(policy: SftpHostKeyPolicy, key: Buffer): boolean {
  if (
    policy.pinnedHostKeySha256 !== undefined &&
    !policy.pinnedHostKeySha256.has(hashHostKey(key))
  ) {
    return false;
  }

  if (policy.knownHosts !== undefined && !matchesKnownHosts(policy, key)) {
    return false;
  }

  return true;
}

function parseKnownHosts(source: ResolvedSshKnownHosts): SftpKnownHostEntry[] | undefined {
  if (source === undefined) {
    return undefined;
  }

  const values = Array.isArray(source) ? source : [source];
  const entries: SftpKnownHostEntry[] = [];

  for (const value of values) {
    const text = Buffer.isBuffer(value) ? value.toString("utf8") : value;
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      const entry = parseKnownHostsLine(line, index + 1);

      if (entry !== undefined) {
        entries.push(entry);
      }
    });
  }

  return entries;
}

function parseKnownHostsLine(line: string, lineNumber: number): SftpKnownHostEntry | undefined {
  const trimmed = line.trim();

  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return undefined;
  }

  const fields = trimmed.split(/\s+/);
  const offset = fields[0]?.startsWith("@") === true ? 1 : 0;
  const hosts = fields[offset];
  const keyType = fields[offset + 1];
  const keyData = fields[offset + 2];

  if (hosts === undefined || keyType === undefined || keyData === undefined) {
    throw createKnownHostsConfigurationError(lineNumber, "is malformed");
  }

  const key = parseKnownHostPublicKey(`${keyType} ${keyData}`, lineNumber);

  return {
    key,
    patterns: hosts.split(",").filter((pattern) => pattern.length > 0),
  };
}

function parseKnownHostPublicKey(value: string, lineNumber: number): ParsedKey {
  const parsed = utils.parseKey(value) as unknown;

  if (parsed instanceof Error) {
    throw createKnownHostsConfigurationError(lineNumber, parsed.message);
  }

  const parsedValues: readonly unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  const parsedKey = parsedValues[0];

  if (!isParsedKey(parsedKey)) {
    throw createKnownHostsConfigurationError(lineNumber, "does not contain a public key");
  }

  return parsedKey;
}

function isParsedKey(value: unknown): value is ParsedKey {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { getPublicSSH?: unknown }).getPublicSSH === "function"
  );
}

function matchesKnownHosts(policy: SftpHostKeyPolicy, key: Buffer): boolean {
  return policy.knownHosts?.some((entry) => knownHostEntryMatches(entry, policy, key)) === true;
}

function knownHostEntryMatches(
  entry: SftpKnownHostEntry,
  policy: SftpHostKeyPolicy,
  key: Buffer,
): boolean {
  const candidates = createKnownHostCandidates(policy.host, policy.port);
  let hostMatched = false;

  for (const pattern of entry.patterns) {
    const negated = pattern.startsWith("!");
    const hostPattern = negated ? pattern.slice(1) : pattern;
    const patternMatched = candidates.some((candidate) =>
      knownHostPatternMatches(hostPattern, candidate),
    );

    if (negated && patternMatched) {
      return false;
    }

    if (patternMatched) {
      hostMatched = true;
    }
  }

  return hostMatched && entry.key.getPublicSSH().equals(key);
}

function createKnownHostCandidates(host: string, port: number): string[] {
  const candidates = [host, `[${host}]:${port}`];

  return port === SFTP_DEFAULT_PORT ? candidates : [`[${host}]:${port}`, host];
}

function knownHostPatternMatches(pattern: string, candidate: string): boolean {
  if (pattern.startsWith("|1|")) {
    return hashedKnownHostPatternMatches(pattern, candidate);
  }

  return wildcardKnownHostPatternToRegExp(pattern).test(candidate);
}

function wildcardKnownHostPatternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");

  return new RegExp(`^${escaped}$`, "i");
}

function hashedKnownHostPatternMatches(pattern: string, candidate: string): boolean {
  const [, version, saltText, hashText] = pattern.split("|");

  if (version !== "1" || saltText === undefined || hashText === undefined) {
    return false;
  }

  const salt = Buffer.from(saltText, "base64");
  const expected = Buffer.from(hashText, "base64");
  const actual = createHmac("sha1", salt).update(candidate).digest();

  return expected.byteLength === actual.byteLength && timingSafeEqual(expected, actual);
}

function normalizeHostKeyPins(value: ResolvedSshHostKeyPins): Set<string> | undefined {
  if (value === undefined) {
    return undefined;
  }

  const pins: readonly string[] = typeof value === "string" ? [value] : value;

  return new Set(pins.map((pin) => normalizeHostKeyPin(pin)));
}

function normalizeHostKeyPin(value: string): string {
  const trimmed = value.trim();
  const hex = trimmed.replace(/:/g, "");

  if (hex.length === 64 && /^[a-f0-9]+$/i.test(hex)) {
    return Buffer.from(hex, "hex").toString("base64").replace(/=+$/g, "");
  }

  const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;

  return Buffer.from(padBase64(bare), "base64").toString("base64").replace(/=+$/g, "");
}

function hashHostKey(key: Buffer): string {
  return createHash("sha256").update(key).digest("base64").replace(/=+$/g, "");
}

function padBase64(value: string): string {
  const remainder = value.length % 4;

  return remainder === 0 ? value : `${value}${"=".repeat(4 - remainder)}`;
}

function createKnownHostsConfigurationError(
  lineNumber: number,
  reason: string,
): ConfigurationError {
  return new ConfigurationError({
    details: { lineNumber, provider: SFTP_PROVIDER_ID },
    message: `SFTP known_hosts line ${lineNumber} ${reason}`,
    protocol: "sftp",
    retryable: false,
  });
}

function resolveSftpAuthentication(profile: ResolvedConnectionProfile): SftpAuthenticationConfig {
  const agent = profile.ssh?.agent;
  const password = resolveOptionalTextCredential(profile.password, "password");
  const privateKey = profile.ssh?.privateKey;
  const passphrase = profile.ssh?.passphrase;
  const keyboardInteractive = profile.ssh?.keyboardInteractive;
  const username = requireTextCredential(profile.username, "username");
  const authHandler: AnyAuthMethod[] = [];

  if (privateKey !== undefined) {
    const method: AnyAuthMethod = {
      key: privateKey,
      type: "publickey",
      username,
    };

    if (passphrase !== undefined) method.passphrase = passphrase;

    authHandler.push(method);
  }

  if (password !== undefined) {
    authHandler.push({
      password,
      type: "password",
      username,
    });
  }

  if (agent !== undefined) {
    authHandler.push({
      agent,
      type: "agent",
      username,
    });
  }

  if (keyboardInteractive !== undefined) {
    authHandler.push({
      prompt: (name, instructions, language, prompts, finish) => {
        handleKeyboardInteractiveChallenge(
          {
            instructions,
            language,
            name,
            prompts,
          },
          keyboardInteractive,
          finish,
        );
      },
      type: "keyboard-interactive",
      username,
    });
  }

  if (authHandler.length === 0) {
    throw new ConfigurationError({
      details: { provider: SFTP_PROVIDER_ID },
      message:
        "SFTP profiles require a password, ssh.privateKey, ssh.agent, or ssh.keyboardInteractive",
      protocol: "sftp",
      retryable: false,
    });
  }

  return { authHandler };
}

function handleKeyboardInteractiveChallenge(
  challenge: SshKeyboardInteractiveChallenge,
  handler: NonNullable<NonNullable<ResolvedConnectionProfile["ssh"]>["keyboardInteractive"]>,
  finish: KeyboardInteractiveCallback,
): void {
  Promise.resolve()
    .then(() => handler(challenge))
    .then((answers) => finish(Array.from(answers)))
    .catch(() => finish([]));
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

async function* createSftpReadSource(
  sftp: SFTPWrapper,
  path: string,
  range: ResolvedSftpReadRange,
  request: ProviderTransferReadRequest,
): AsyncGenerator<Uint8Array> {
  if (range.length <= 0) {
    return;
  }

  const stream = sftp.createReadStream(path, {
    end: range.offset + range.length - 1,
    start: range.offset,
  }) as ReadStream & AsyncIterable<Buffer>;
  const closeOnAbort = () => stream.destroy();

  request.signal?.addEventListener("abort", closeOnAbort, { once: true });

  try {
    for await (const chunk of stream) {
      request.throwIfAborted();
      yield new Uint8Array(Buffer.from(chunk));
    }
  } catch (error) {
    throw mapSftpError(error, { command: "READ", path });
  } finally {
    request.signal?.removeEventListener("abort", closeOnAbort);
  }
}

async function writeSftpContent(
  sftp: SFTPWrapper,
  path: string,
  request: ProviderTransferWriteRequest,
  offset: number | undefined,
): Promise<number> {
  const stream = createSftpWriteStream(sftp, path, offset);
  const closeOnAbort = () => stream.destroy();
  let bytesTransferred = 0;

  request.signal?.addEventListener("abort", closeOnAbort, { once: true });

  try {
    for await (const chunk of request.content) {
      request.throwIfAborted();
      await writeSftpChunk(stream, chunk);
      bytesTransferred += chunk.byteLength;
      request.reportProgress(bytesTransferred, request.totalBytes);
    }

    await endSftpWriteStream(stream);
    return bytesTransferred;
  } catch (error) {
    stream.destroy();
    throw error;
  } finally {
    request.signal?.removeEventListener("abort", closeOnAbort);
  }
}

function createSftpWriteStream(
  sftp: SFTPWrapper,
  path: string,
  offset: number | undefined,
): WriteStream {
  if (offset === undefined) {
    return sftp.createWriteStream(path, { flags: "w" });
  }

  return sftp.createWriteStream(path, { flags: "r+", start: offset });
}

function writeSftpChunk(stream: WriteStream, chunk: Uint8Array): Promise<void> {
  if (chunk.byteLength === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      stream.off("error", handleError);
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    stream.once("error", handleError);
    stream.write(Buffer.from(chunk), (error?: Error | null) => {
      cleanup();

      if (error != null) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function endSftpWriteStream(stream: WriteStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      stream.off("close", handleClose);
      stream.off("error", handleError);
    };
    const handleClose = () => {
      cleanup();
      resolve();
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    stream.once("close", handleClose);
    stream.once("error", handleError);
    stream.end();
  });
}

function resolveSftpReadRange(
  size: number,
  range: ProviderTransferReadRequest["range"],
): ResolvedSftpReadRange {
  if (range === undefined) {
    return { length: size, offset: 0 };
  }

  const requestedOffset = normalizeByteCount(range.offset, "offset", "/");
  const requestedLength =
    range.length === undefined
      ? size - Math.min(requestedOffset, size)
      : normalizeByteCount(range.length, "length", "/");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));

  return { length, offset };
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
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP provider ${field} must be a non-negative number`,
      path,
      protocol: "sftp",
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
  const text = resolveOptionalTextCredential(value, field);

  if (text === undefined) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP profiles require a ${field}`,
      protocol: "sftp",
      retryable: false,
    });
  }

  return text;
}

function resolveOptionalTextCredential(
  value: SecretValue | undefined,
  field: "password" | "username",
): string | undefined {
  if (value === undefined) {
    return undefined;
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

function createSftpPathNotFoundError(path: string, message: string): PathNotFoundError {
  return new PathNotFoundError({
    details: { provider: SFTP_PROVIDER_ID },
    message,
    path,
    protocol: "sftp",
    retryable: false,
  });
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
