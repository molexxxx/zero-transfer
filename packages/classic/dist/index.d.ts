import { EventEmitter } from 'node:events';
import { SecureVersion, PeerCertificate } from 'node:tls';
import { Readable } from 'node:stream';
import { Buffer as Buffer$1 } from 'node:buffer';
import { Socket } from 'node:net';

/**
 * Structured logging contracts and helpers for ZeroTransfer.
 *
 * The logger shape is intentionally compatible with popular structured loggers while
 * staying small enough for applications to implement directly.
 *
 * @module logging/Logger
 */
/** Supported ZeroTransfer log levels. */
type LogLevel = "trace" | "debug" | "info" | "warn" | "error";
/**
 * Complete structured log record emitted by ZeroTransfer helpers.
 */
interface LogRecord {
    /** Severity level for the record. */
    level: LogLevel;
    /** Human-readable summary message. */
    message: string;
    /** SDK component that produced the record. */
    component?: string;
    /** Active protocol for the record. */
    protocol?: string;
    /** Remote host associated with the record. */
    host?: string;
    /** Correlation id for a connection lifecycle. */
    connectionId?: string;
    /** Correlation id for a protocol command. */
    commandId?: string;
    /** Correlation id for a transfer lifecycle. */
    transferId?: string;
    /** Remote or local path associated with the record. */
    path?: string;
    /** Operation duration in milliseconds. */
    durationMs?: number;
    /** Byte count associated with the operation. */
    bytes?: number;
    /** Additional structured fields supplied by adapters or services. */
    [key: string]: unknown;
}
/**
 * Log record input accepted by {@link emitLog}; the helper adds the level.
 */
interface LogRecordInput extends Omit<LogRecord, "level"> {
    /** Human-readable summary message. */
    message: string;
}
/**
 * Logger method signature used for each severity level.
 *
 * @param record - Structured log record.
 * @param message - Convenience message argument for console-like loggers.
 */
type LoggerMethod = (record: LogRecord, message?: string) => void;
/**
 * Partial structured logger accepted by ZeroTransfer.
 */
interface ZeroTransferLogger {
    /** Receives highly detailed diagnostic records. */
    trace?: LoggerMethod;
    /** Receives development/debugging records. */
    debug?: LoggerMethod;
    /** Receives normal lifecycle records. */
    info?: LoggerMethod;
    /** Receives recoverable issue records. */
    warn?: LoggerMethod;
    /** Receives failed operation records. */
    error?: LoggerMethod;
}
/**
 * Logger implementation that intentionally drops every record.
 */
declare const noopLogger: Required<ZeroTransferLogger>;
/**
 * Emits a structured log record if the logger implements the requested level.
 *
 * @param logger - Logger that may contain a method for the requested level.
 * @param level - Severity level to emit.
 * @param record - Log record fields without the level property.
 * @returns Nothing; missing logger methods are ignored.
 */
declare function emitLog(logger: ZeroTransferLogger, level: LogLevel, record: LogRecordInput): void;

/**
 * Provider identifiers used by the provider-neutral ZeroTransfer core.
 *
 * @module core/ProviderId
 */
/** Classic remote-transfer providers kept compatible with the original protocol field. */
declare const CLASSIC_PROVIDER_IDS: readonly ["ftp", "ftps", "sftp"];
/** Provider ids that map directly to the original protocol-focused alpha facade. */
type ClassicProviderId = (typeof CLASSIC_PROVIDER_IDS)[number];
/** Provider ids reserved for first-party ZeroTransfer adapters. */
type BuiltInProviderId = ClassicProviderId | "memory" | "local" | "http" | "https" | "webdav" | "s3" | "azure-blob" | "gcs" | "dropbox" | "google-drive" | "one-drive";
/** Provider identifier accepted by registries, profiles, and provider factories. */
type ProviderId = BuiltInProviderId | (string & {});
/** Minimal shape used to resolve a provider from new and compatibility profile fields. */
interface ProviderSelection {
    /** Provider id for provider-neutral ZeroTransfer profiles. */
    provider?: ProviderId;
    /** Compatibility protocol field accepted while the provider-neutral API rolls out. */
    protocol?: ClassicProviderId;
}
/**
 * Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family.
 *
 * @param providerId - Provider id to inspect.
 * @returns `true` when the id is one of the classic protocol providers.
 */
declare function isClassicProviderId(providerId: ProviderId | undefined): providerId is ClassicProviderId;
/**
 * Resolves the provider id from a profile, preferring the new `provider` field.
 *
 * @param selection - Profile-like object containing provider and/or protocol fields.
 * @returns The selected provider id, or `undefined` when neither field is present.
 */
declare function resolveProviderId(selection: ProviderSelection): ProviderId | undefined;

/**
 * Provider capability contracts for the provider-neutral ZeroTransfer core.
 *
 * @module core/CapabilitySet
 */

/** Authentication mechanisms a provider can advertise. */
type AuthenticationCapability = "anonymous" | "password" | "private-key" | "token" | "oauth" | "service-account" | (string & {});
/** Checksum or integrity mechanisms a provider can advertise. */
type ChecksumCapability = "crc32" | "crc32c" | "etag" | "md5" | "sha1" | "sha256" | (string & {});
/** Metadata fields a provider can preserve or report. */
type MetadataCapability = "accessedAt" | "createdAt" | "group" | "mimeType" | "modifiedAt" | "owner" | "permissions" | "storageClass" | "symlinkTarget" | "tags" | "uniqueId" | (string & {});
/**
 * Capability snapshot advertised by a provider factory and active session.
 */
interface CapabilitySet {
    /** Provider this capability set describes. */
    provider: ProviderId;
    /** Authentication mechanisms accepted by the provider. */
    authentication: AuthenticationCapability[];
    /** Whether the provider can list child entries. */
    list: boolean;
    /** Whether the provider can read metadata for a path. */
    stat: boolean;
    /** Whether the provider can produce readable streams. */
    readStream: boolean;
    /** Whether the provider can accept writable streams. */
    writeStream: boolean;
    /** Whether the provider can copy data without routing bytes through the client. */
    serverSideCopy: boolean;
    /** Whether the provider can move data without routing bytes through the client. */
    serverSideMove: boolean;
    /** Whether the provider can resume partial downloads. */
    resumeDownload: boolean;
    /** Whether the provider can resume partial uploads. */
    resumeUpload: boolean;
    /** Checksum or provider hash mechanisms available for verification. */
    checksum: ChecksumCapability[];
    /** Whether rename operations are atomic within the provider. */
    atomicRename: boolean;
    /** Whether chmod-style permission changes are supported. */
    chmod: boolean;
    /** Whether owner changes are supported. */
    chown: boolean;
    /** Whether symbolic links are supported. */
    symlink: boolean;
    /** Metadata fields the provider can preserve or report. */
    metadata: MetadataCapability[];
    /** Recommended maximum concurrent operations for this provider. */
    maxConcurrency?: number;
    /** Human-readable caveats for diagnostics or provider matrices. */
    notes?: string[];
}

/**
 * Secret source contracts and resolution helpers for connection profiles.
 *
 * @module profiles/SecretSource
 */

/** Resolved secret value accepted by profile credential fields. */
type SecretValue = string | Buffer$1;
/** Callback source used by applications to integrate vaults or credential brokers. */
type SecretProvider = () => SecretValue | Promise<SecretValue>;
/** Inline secret descriptor. Prefer env, path, or callback sources for real applications. */
interface ValueSecretSource {
    /** Inline secret value. */
    value: SecretValue;
}
/** Environment variable descriptor for text secrets. */
interface EnvSecretSource {
    /** Environment variable containing the secret. */
    env: string;
}
/** Environment variable descriptor for base64-encoded binary secrets. */
interface Base64EnvSecretSource {
    /** Environment variable containing a base64-encoded secret. */
    base64Env: string;
}
/** File-backed secret descriptor. */
interface FileSecretSource {
    /** Path to the file containing the secret. */
    path: string;
    /** Text encoding to use, or `buffer` to return raw bytes. Defaults to `utf8`. */
    encoding?: BufferEncoding | "buffer";
}
/** Secret source accepted by profile credential fields. */
type SecretSource = SecretValue | SecretProvider | ValueSecretSource | EnvSecretSource | Base64EnvSecretSource | FileSecretSource;
/** Injectable dependencies used by tests or host applications during secret resolution. */
interface ResolveSecretOptions {
    /** Environment source. Defaults to `process.env`. */
    env?: NodeJS.ProcessEnv;
    /** File reader. Defaults to `fs.promises.readFile`. */
    readFile?: (path: string) => Promise<Buffer$1> | Buffer$1;
}
/**
 * Resolves a secret source into a string or Buffer without logging the value.
 *
 * @param source - Secret source to resolve.
 * @param options - Optional env and file-reader overrides.
 * @returns Resolved secret value.
 * @throws {@link ConfigurationError} When a descriptor is invalid or unavailable.
 */
declare function resolveSecret(source: SecretSource, options?: ResolveSecretOptions): Promise<SecretValue>;
/**
 * Redacts a secret source or resolved secret for safe diagnostics.
 *
 * @param source - Secret source or resolved value to sanitize.
 * @returns Redacted placeholder or descriptor shape.
 */
declare function redactSecretSource(source: SecretSource | SecretValue): unknown;

/**
 * Public data contracts shared by the ZeroTransfer facade, adapters, and services.
 *
 * These types are intentionally protocol-neutral so FTP, FTPS, and SFTP adapters can
 * report the same metadata, transfer, and connection shapes to application code.
 *
 * @module types/public
 */

/** Supported remote file-transfer protocols. */
type RemoteProtocol = ClassicProviderId;
/** Normalized remote entry kinds returned by listing and metadata operations. */
type RemoteEntryType = "file" | "directory" | "symlink" | "unknown";
/**
 * Portable permission metadata for a remote entry.
 */
interface RemotePermissions {
    /** Raw protocol permission text, such as Unix mode characters or MLSD `perm` facts. */
    raw?: string;
    /** User/owner permission component when the protocol exposes it. */
    user?: string;
    /** Group permission component when the protocol exposes it. */
    group?: string;
    /** Other/world permission component when the protocol exposes it. */
    other?: string;
}
/**
 * Normalized remote file-system entry.
 */
interface RemoteEntry {
    /** Absolute or normalized remote path for the entry. */
    path: string;
    /** Entry basename without parent directory segments. */
    name: string;
    /** Normalized entry kind. */
    type: RemoteEntryType;
    /** Entry size in bytes when known. */
    size?: number;
    /** Last modification time when known. */
    modifiedAt?: Date;
    /** Creation time when the protocol exposes it. */
    createdAt?: Date;
    /** Last access time when the protocol exposes it. */
    accessedAt?: Date;
    /** Portable permission details when known. */
    permissions?: RemotePermissions;
    /** Owner name or id when known. */
    owner?: string;
    /** Group name or id when known. */
    group?: string;
    /** Target path for symbolic links when known. */
    symlinkTarget?: string;
    /** Protocol-specific stable identity when available. */
    uniqueId?: string;
    /** Raw protocol payload retained for diagnostics or advanced callers. */
    raw?: unknown;
}
/**
 * Metadata for a remote entry that is known to exist.
 */
interface RemoteStat extends RemoteEntry {
    /** Existence discriminator for successful stat operations. */
    exists: true;
}
/**
 * TLS material source accepted by certificate-aware connection profiles.
 *
 * A single source is used for most fields; `ca` may use an array to preserve an
 * ordered certificate authority bundle.
 */
type TlsSecretSource = SecretSource | SecretSource[];
/** Known-hosts material source accepted by SSH connection profiles. */
type SshKnownHostsSource = SecretSource | SecretSource[];
/** Minimal SSH agent contract used by profile validation and SSH adapters. */
interface SshAgentLike {
    /** Returns public identities exposed by the agent implementation. */
    getIdentities: (...args: any[]) => unknown;
    /** Signs payloads using a selected identity. */
    sign: (...args: any[]) => unknown;
}
/** Ordered algorithm list mutation operations used by SSH adapters. */
interface SshAlgorithmMutations {
    append?: string | readonly string[];
    prepend?: string | readonly string[];
    remove?: string | readonly string[];
}
/** Single SSH algorithm override value accepted by connection profiles. */
type SshAlgorithmOverride = readonly string[] | SshAlgorithmMutations;
/** SSH agent source accepted by SFTP providers. */
type SshAgentSource = string | SshAgentLike;
/** SSH transport algorithm overrides accepted by SFTP providers. */
type SshAlgorithms = Record<string, SshAlgorithmOverride | undefined>;
/** Context passed to SSH socket factories before opening an SSH session. */
interface SshSocketFactoryContext {
    /** Target SSH host from the resolved connection profile. */
    host: string;
    /** Target SSH port from the resolved connection profile. */
    port: number;
    /** Resolved username, when configured on the connection profile. */
    username?: string;
    /** Abort signal from the connection profile, when one is configured. */
    signal?: AbortSignal;
}
/**
 * Creates a preconnected socket-like stream for SSH sessions.
 *
 * Use this hook for HTTP CONNECT, SOCKS, bastion, or custom tunnel integrations.
 *
 * @param context - Resolved SSH target information for the socket being opened.
 * @returns Preconnected readable stream, or a promise for one, passed to the SSH adapter socket option.
 */
type SshSocketFactory = (context: SshSocketFactoryContext) => Readable | Promise<Readable>;
/** Prompt metadata supplied by an SSH keyboard-interactive server challenge. */
interface SshKeyboardInteractivePrompt {
    /** Human-readable prompt text supplied by the SSH server. */
    prompt: string;
    /** Whether the answer may be echoed to a terminal or UI. */
    echo?: boolean;
}
/** Input passed to SSH keyboard-interactive answer providers. */
interface SshKeyboardInteractiveChallenge {
    /** Server-provided challenge title. */
    name: string;
    /** Server-provided instructions for the prompt set. */
    instructions: string;
    /** Server-provided language tag, when supplied. */
    language: string;
    /** Ordered prompts that require answers. */
    prompts: readonly SshKeyboardInteractivePrompt[];
}
/** Provides ordered answers for an SSH keyboard-interactive authentication challenge. */
type SshKeyboardInteractiveHandler = (challenge: SshKeyboardInteractiveChallenge) => readonly string[] | Promise<readonly string[]>;
/**
 * TLS settings shared by certificate-aware providers such as FTPS and future HTTPS/WebDAV adapters.
 *
 * Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
 * and are resolved by providers before opening TLS sockets.
 */
interface TlsProfile {
    /** Certificate authority bundle used to validate private or self-signed endpoints. */
    ca?: TlsSecretSource;
    /** Client certificate PEM used for mutual TLS when a provider requires it. */
    cert?: SecretSource;
    /** Client private key PEM used with `cert`. */
    key?: SecretSource;
    /** PFX/P12 client certificate bundle. */
    pfx?: SecretSource;
    /** Passphrase for an encrypted private key or PFX/P12 bundle. */
    passphrase?: SecretSource;
    /** Server name used for SNI and certificate identity checks. Defaults to the profile host. */
    servername?: string;
    /** Whether TLS certificate validation is required. Defaults to `true`. */
    rejectUnauthorized?: boolean;
    /** Minimum TLS protocol version accepted by the client. */
    minVersion?: SecureVersion;
    /** Maximum TLS protocol version accepted by the client. */
    maxVersion?: SecureVersion;
    /**
     * Optional. Expected server certificate SHA-256 fingerprint(s) for **certificate pinning**, in
     * hex form with or without colons. When present, the TLS handshake additionally requires the
     * leaf certificate's SHA-256 fingerprint to match one of these values.
     *
     * Not required for normal CA-trusted endpoints — public CAs and `ca` bundles already gate
     * trust via `rejectUnauthorized`. Pinning is **recommended for production** when you control
     * the server and want defence-in-depth against rogue certificates issued by trusted CAs.
     *
     * @example "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
     */
    pinnedFingerprint256?: string | readonly string[];
    /** Optional custom server identity checker for private PKI or certificate pinning. */
    checkServerIdentity?: (host: string, cert: PeerCertificate) => Error | undefined;
}
/**
 * SSH authentication material for SFTP-style providers.
 *
 * Secret-bearing fields accept inline values, environment-backed values, or file-backed values,
 * and are resolved by providers before opening SSH sessions.
 */
interface SshProfile {
    /** SSH agent socket path or agent instance used for agent-based public-key authentication. */
    agent?: SshAgentSource;
    /** Explicit SSH transport algorithm overrides for ciphers, KEX, host keys, MACs, and compression. */
    algorithms?: SshAlgorithms;
    /** Private key material used for public-key authentication. */
    privateKey?: SecretSource;
    /** Passphrase used to decrypt an encrypted private key. */
    passphrase?: SecretSource;
    /**
     * Optional. OpenSSH `known_hosts` content used for **strict SFTP host-key verification**.
     * Mutually exclusive with provider-level `hostHash`/`hostVerifier` options.
     *
     * Not required for the connection to succeed, but **strongly recommended for production**:
     * without `knownHosts` (and without {@link SshProfile.pinnedHostKeySha256 | pinnedHostKeySha256}),
     * the SSH session accepts any host key the server presents, leaving you exposed to MITM.
     */
    knownHosts?: SshKnownHostsSource;
    /**
     * Optional. SSH host-key SHA-256 fingerprint(s) the remote must present, in OpenSSH
     * `SHA256:<base64>` form, raw base64, or hex.
     *
     * Use this as a lighter-weight alternative to a full `known_hosts` file when you only need
     * to pin a single host. Like `knownHosts`, it is **optional but recommended for production**;
     * leaving both unset disables host-key verification entirely.
     *
     * @example "SHA256:abc123basesixfourpinFromKnownHosts="
     */
    pinnedHostKeySha256?: string | readonly string[];
    /** Runtime callback that answers SSH keyboard-interactive authentication prompts. */
    keyboardInteractive?: SshKeyboardInteractiveHandler;
    /** Runtime callback that returns a preconnected stream used instead of opening a direct TCP socket. */
    socketFactory?: SshSocketFactory;
}
/**
 * Connection settings accepted by facade and adapter implementations.
 *
 * Every `ConnectionProfile` has a `host` and a `provider` (or `protocol`).
 * Authentication and transport-specific material is layered on via the
 * optional `ssh`, `tls`, `oauth`, and provider-specific blocks (e.g. `s3`,
 * `azure`, `dropbox`).
 *
 * @example SFTP with public-key auth
 * ```ts
 * const profile: ConnectionProfile = {
 *   host: "sftp.example.com",
 *   provider: "sftp",
 *   username: "deploy",
 *   ssh: {
 *     privateKey: { path: "./keys/id_ed25519" },
 *     pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
 *   },
 * };
 * ```
 *
 * @example FTPS with username/password and public-CA TLS
 * ```ts
 * const profile: ConnectionProfile = {
 *   host: "ftps.example.com",
 *   provider: "ftps",
 *   username: "deploy",
 *   password: { env: "FTPS_PASSWORD" },
 *   tls: { minVersion: "TLSv1.2" },
 * };
 * ```
 *
 * @example S3-compatible
 * ```ts
 * const profile: ConnectionProfile = {
 *   host: "my-bucket",
 *   provider: "s3",
 *   username: process.env.AWS_ACCESS_KEY_ID,
 *   password: { env: "AWS_SECRET_ACCESS_KEY" },
 *   s3: { region: "us-east-1" },
 * };
 * ```
 */
interface ConnectionProfile {
    /** Provider to use for this connection. Prefer this over the compatibility protocol field. */
    provider?: ProviderId;
    /** Protocol to use for this connection, overriding the client default. */
    protocol?: RemoteProtocol;
    /** Remote hostname or IP address. */
    host: string;
    /** Remote port; adapters should apply protocol defaults when omitted. */
    port?: number;
    /** Username, account identifier, or deferred secret source for authentication. */
    username?: SecretSource;
    /** Password or deferred secret source for password-based authentication. */
    password?: SecretSource;
    /** Whether encrypted transport should be requested for protocols that support it. */
    secure?: boolean;
    /** TLS settings for encrypted providers such as FTPS. */
    tls?: TlsProfile;
    /** SSH settings for SFTP providers. */
    ssh?: SshProfile;
    /** Operation or connection timeout in milliseconds. */
    timeoutMs?: number;
    /** Abort signal used to cancel connection setup or long-running operations. */
    signal?: AbortSignal;
    /** Per-profile logger override. */
    logger?: ZeroTransferLogger;
}
/**
 * Options for remote directory listing operations.
 */
interface ListOptions {
    /** Recursively walk child directories when supported by the adapter. */
    recursive?: boolean;
    /** Include hidden or dot-prefixed entries when the protocol/listing format supports it. */
    includeHidden?: boolean;
    /** Abort signal used to cancel the listing operation. */
    signal?: AbortSignal;
}
/**
 * Options for remote metadata lookup operations.
 */
interface StatOptions {
    /** Abort signal used to cancel the metadata operation. */
    signal?: AbortSignal;
}
/**
 * Options for removing a remote file entry.
 */
interface RemoveOptions {
    /** Abort signal used to cancel the operation. */
    signal?: AbortSignal;
    /** When true, do not throw if the path does not exist. */
    ignoreMissing?: boolean;
}
/**
 * Options for renaming or moving a remote entry.
 */
interface RenameOptions {
    /** Abort signal used to cancel the operation. */
    signal?: AbortSignal;
    /** Allow overwriting an existing destination when the provider supports it. */
    overwrite?: boolean;
}
/**
 * Options for creating a remote directory.
 */
interface MkdirOptions {
    /** Abort signal used to cancel the operation. */
    signal?: AbortSignal;
    /** Create missing parent directories along the way. */
    recursive?: boolean;
}
/**
 * Options for removing a remote directory.
 */
interface RmdirOptions {
    /** Abort signal used to cancel the operation. */
    signal?: AbortSignal;
    /** Recursively remove non-empty directory contents. */
    recursive?: boolean;
    /** When true, do not throw if the path does not exist. */
    ignoreMissing?: boolean;
}
/**
 * Progress snapshot emitted while a transfer is running.
 */
interface TransferProgressEvent {
    /** Stable transfer identifier used to correlate logs and events. */
    transferId: string;
    /** Bytes successfully transferred so far. */
    bytesTransferred: number;
    /** Total expected bytes when the adapter can determine the remote or local size. */
    totalBytes?: number;
    /** Time at which the transfer began. */
    startedAt: Date;
    /** Elapsed transfer time in milliseconds. */
    elapsedMs: number;
    /** Current average throughput in bytes per second. */
    bytesPerSecond: number;
    /** Completion percentage when `totalBytes` is known. */
    percent?: number;
}
/**
 * Final summary for a completed transfer.
 */
interface TransferResult {
    /** Local or remote source path when known for the operation. */
    sourcePath?: string;
    /** Local or remote destination path for the completed transfer. */
    destinationPath: string;
    /** Total bytes transferred. */
    bytesTransferred: number;
    /** Time at which the transfer began. */
    startedAt: Date;
    /** Time at which the transfer completed. */
    completedAt: Date;
    /** Total transfer duration in milliseconds. */
    durationMs: number;
    /** Average throughput in bytes per second. */
    averageBytesPerSecond: number;
    /** Whether the transfer resumed from a prior partial state. */
    resumed: boolean;
    /** Whether post-transfer verification completed successfully. */
    verified: boolean;
    /** Optional checksum value produced or verified by the transfer workflow. */
    checksum?: string;
}

/**
 * Provider-neutral remote file-system contract.
 *
 * @module providers/RemoteFileSystem
 */

/** Minimal file-system surface shared by provider sessions. */
interface RemoteFileSystem {
    /** Lists entries for a provider path. */
    list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
    /** Reads metadata for a provider path. */
    stat(path: string, options?: StatOptions): Promise<RemoteStat>;
    /** Removes a file entry when supported by the provider. */
    remove?(path: string, options?: RemoveOptions): Promise<void>;
    /** Renames or moves an entry when supported by the provider. */
    rename?(from: string, to: string, options?: RenameOptions): Promise<void>;
    /** Creates a directory when supported by the provider. */
    mkdir?(path: string, options?: MkdirOptions): Promise<void>;
    /** Removes a directory when supported by the provider. */
    rmdir?(path: string, options?: RmdirOptions): Promise<void>;
}

/**
 * Transfer job and receipt contracts used by the transfer engine foundation.
 *
 * @module transfers/TransferJob
 */

/** Provider-neutral transfer operation names. */
type TransferOperation = "copy" | "delete" | "download" | "move" | "sync" | "upload" | (string & {});
/** Endpoint referenced by a transfer job or receipt. */
interface TransferEndpoint {
    /** Provider that owns the endpoint when known. */
    provider?: ProviderId;
    /** Provider, remote, or local path for the endpoint. */
    path: string;
}
/** Transfer job input consumed by {@link TransferEngine}. */
interface TransferJob {
    /** Stable job identifier for correlation. */
    id: string;
    /** Operation the job performs. */
    operation: TransferOperation;
    /** Source endpoint for operations that read data. */
    source?: TransferEndpoint;
    /** Destination endpoint for operations that write data. */
    destination?: TransferEndpoint;
    /** Expected total bytes when known before execution. */
    totalBytes?: number;
    /** Whether this job is resuming prior partial work. */
    resumed?: boolean;
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/** Optional throughput limit shape that concrete transfer executors may honor. */
interface TransferBandwidthLimit {
    /** Maximum sustained transfer rate in bytes per second. */
    bytesPerSecond: number;
    /** Optional burst allowance in bytes for token-bucket-style implementations. */
    burstBytes?: number;
}
/** Timeout policy applied by the transfer engine. */
interface TransferTimeoutPolicy {
    /** Maximum duration for the full engine execution, including retries, in milliseconds. */
    timeoutMs?: number;
    /** Whether timeout failures are retryable. Defaults to `true`. */
    retryable?: boolean;
}
/** Normalized post-transfer verification details. */
interface TransferVerificationResult {
    /** Whether verification completed successfully. */
    verified: boolean;
    /** Verification method, such as checksum, size, timestamp, or provider-native. */
    method?: string;
    /** Checksum value produced or verified by the operation. */
    checksum?: string;
    /** Expected checksum when a checksum comparison was performed. */
    expectedChecksum?: string;
    /** Actual checksum observed by the operation. */
    actualChecksum?: string;
    /** Caller-defined verification details retained for diagnostics. */
    details?: Record<string, unknown>;
}
/** Result returned by a transfer operation implementation. */
interface TransferExecutionResult {
    /** Bytes transferred by the completed operation. */
    bytesTransferred: number;
    /** Total expected bytes when discovered during execution. */
    totalBytes?: number;
    /** Whether the operation resumed prior partial work. */
    resumed?: boolean;
    /** Whether post-transfer verification completed successfully. */
    verified?: boolean;
    /** Normalized post-transfer verification details. */
    verification?: TransferVerificationResult;
    /** Optional checksum value produced or verified by the operation. */
    checksum?: string;
    /** Non-fatal warnings produced during execution. */
    warnings?: string[];
}
/** Serializable error summary retained in failed attempts. */
interface TransferAttemptError {
    /** Error class or constructor name. */
    name: string;
    /** Human-readable error message. */
    message: string;
    /** Stable SDK error code when available. */
    code?: string;
    /** Whether retry policy may retry the failure. */
    retryable?: boolean;
}
/** Execution attempt retained in a transfer receipt. */
interface TransferAttempt {
    /** One-based attempt number. */
    attempt: number;
    /** Time this attempt began. */
    startedAt: Date;
    /** Time this attempt finished or failed. */
    completedAt: Date;
    /** Attempt duration in milliseconds. */
    durationMs: number;
    /** Bytes reported by the attempt before completion or failure. */
    bytesTransferred: number;
    /** Error summary for failed attempts. */
    error?: TransferAttemptError;
}
/** Audit-friendly receipt for a completed transfer job. */
interface TransferReceipt {
    /** Stable transfer identifier used for progress and log correlation. */
    transferId: string;
    /** Original job identifier. */
    jobId: string;
    /** Operation performed by the job. */
    operation: TransferOperation;
    /** Source endpoint when supplied by the job. */
    source?: TransferEndpoint;
    /** Destination endpoint when supplied by the job. */
    destination?: TransferEndpoint;
    /** Total bytes transferred by the successful operation. */
    bytesTransferred: number;
    /** Expected total bytes when known. */
    totalBytes?: number;
    /** Time the first attempt began. */
    startedAt: Date;
    /** Time the successful attempt completed. */
    completedAt: Date;
    /** Total elapsed time in milliseconds. */
    durationMs: number;
    /** Average throughput in bytes per second. */
    averageBytesPerSecond: number;
    /** Whether the transfer resumed prior partial work. */
    resumed: boolean;
    /** Whether post-transfer verification completed successfully. */
    verified: boolean;
    /** Normalized post-transfer verification details when supplied by the operation. */
    verification?: TransferVerificationResult;
    /** Optional checksum value produced or verified by the operation. */
    checksum?: string;
    /** Attempt history, including retry failures. */
    attempts: TransferAttempt[];
    /** Non-fatal warnings produced during execution. */
    warnings: string[];
    /** Caller-defined metadata retained from the job. */
    metadata?: Record<string, unknown>;
}

/** Context passed to a concrete transfer operation. */
interface TransferExecutionContext {
    /** Job being executed. */
    job: TransferJob;
    /** One-based attempt number. */
    attempt: number;
    /** Abort signal active for this execution when supplied. */
    signal?: AbortSignal;
    /** Optional throughput limit shape for concrete executors to honor. */
    bandwidthLimit?: TransferBandwidthLimit;
    /** Throws an SDK abort error when the active signal has been cancelled. */
    throwIfAborted(): void;
    /** Emits a normalized progress event through engine options. */
    reportProgress(bytesTransferred: number, totalBytes?: number): TransferProgressEvent;
}
/** Concrete transfer operation implementation used by the engine. */
type TransferExecutor = (context: TransferExecutionContext) => Promise<TransferExecutionResult> | TransferExecutionResult;
/** Input used by retry policy hooks. */
interface TransferRetryDecisionInput {
    /** Error thrown by the failed attempt. */
    error: unknown;
    /** One-based attempt number that failed. */
    attempt: number;
    /** Job being executed. */
    job: TransferJob;
}
/** Retry policy for transfer execution. */
interface TransferRetryPolicy {
    /** Maximum total attempts, including the first attempt. Defaults to `1`. */
    maxAttempts?: number;
    /** Decides whether a failed attempt should be retried. Defaults to SDK retryability metadata. */
    shouldRetry?(input: TransferRetryDecisionInput): boolean;
    /** Observes retry decisions before the next attempt starts. */
    onRetry?(input: TransferRetryDecisionInput): void;
}
/** Options used by {@link TransferEngine.execute}. */
interface TransferEngineExecuteOptions {
    /** Abort signal used to cancel the job. */
    signal?: AbortSignal;
    /** Retry policy used for failed attempts. */
    retry?: TransferRetryPolicy;
    /** Progress observer for normalized transfer progress events. */
    onProgress?(event: TransferProgressEvent): void;
    /** Timeout policy enforced by the engine. */
    timeout?: TransferTimeoutPolicy;
    /** Optional throughput limit shape passed through to concrete executors. */
    bandwidthLimit?: TransferBandwidthLimit;
}
/** Construction options for deterministic tests and host integration. */
interface TransferEngineOptions {
    /** Clock used for receipts and progress events. Defaults to `new Date()`. */
    now?: () => Date;
}
/**
 * Executes transfer jobs and produces audit-friendly receipts.
 *
 * The engine is the lowest-level entry point in the transfer stack: it owns
 * retry policy, attempt history, abort propagation, progress event
 * normalization, and receipt construction. Most callers reach the engine
 * indirectly through {@link runRoute}, {@link uploadFile}, {@link downloadFile},
 * {@link copyBetween}, or {@link TransferQueue}; instantiate it directly when
 * you need full control over execution semantics.
 *
 * @example Execute a single job with a custom executor
 * ```ts
 * import { TransferEngine, type TransferExecutor, type TransferJob } from "@zero-transfer/sdk";
 *
 * const engine = new TransferEngine();
 *
 * const executor: TransferExecutor = async ({ job, signal, onProgress }) => {
 *   onProgress?.({ jobId: job.id, bytesTransferred: 0 });
 *   // … perform the bytes here, honoring `signal` …
 *   return { jobId: job.id, bytesTransferred: 1234, completedAt: new Date() };
 * };
 *
 * const job: TransferJob = {
 *   id: "manual-1",
 *   operation: "upload",
 *   source: { profile: localProfile, path: "./data.bin" },
 *   destination: { profile: s3Profile, path: "/data/data.bin" },
 * };
 *
 * const receipt = await engine.execute(job, executor, {
 *   retry: { maxAttempts: 3, baseDelayMs: 250 },
 * });
 * console.log(receipt.attempts.length); // 1 on success
 * ```
 */
declare class TransferEngine {
    private readonly now;
    /**
     * Creates a transfer engine.
     *
     * @param options - Optional clock override for deterministic tests.
     */
    constructor(options?: TransferEngineOptions);
    /**
     * Executes a transfer job through a caller-supplied operation.
     *
     * @param job - Job metadata used for correlation and receipts.
     * @param executor - Concrete transfer operation implementation.
     * @param options - Optional abort, retry, and progress hooks.
     * @returns Receipt for the completed transfer.
     * @throws {@link AbortError} When execution is cancelled.
     * @throws {@link TransferError} When all attempts fail.
     */
    execute(job: TransferJob, executor: TransferExecutor, options?: TransferEngineExecuteOptions): Promise<TransferReceipt>;
    private createExecutionContext;
    private throwIfAborted;
}

/**
 * Provider-backed transfer read/write contracts.
 *
 * @module providers/ProviderTransferOperations
 */

/** Binary chunk shape used by provider transfer streams. */
type TransferDataChunk = Uint8Array;
/** Provider-neutral transfer content source. Node readable streams satisfy this shape. */
type TransferDataSource = AsyncIterable<TransferDataChunk>;
/** Byte range requested from a readable provider endpoint. */
interface TransferByteRange {
    /** Zero-based byte offset where reading should begin. */
    offset: number;
    /** Maximum number of bytes to read when known. */
    length?: number;
}
/** Shared provider transfer request fields. */
interface ProviderTransferRequest extends TransferExecutionContext {
    /** Endpoint owned by the provider handling this request. */
    endpoint: TransferEndpoint;
}
/** Request passed to provider read implementations. */
interface ProviderTransferReadRequest extends ProviderTransferRequest {
    /** Optional byte range for resumed or partial reads. */
    range?: TransferByteRange;
}
/** Result returned by provider read implementations. */
interface ProviderTransferReadResult {
    /** Content stream produced by the provider. */
    content: TransferDataSource;
    /** Bytes already read by the provider before returning the content stream, if any. */
    bytesRead?: number;
    /** Expected total bytes for the content stream when known. */
    totalBytes?: number;
    /** Verification details produced while opening or reading the source. */
    verification?: TransferVerificationResult;
    /** Checksum produced while opening or reading the source. */
    checksum?: string;
    /** Non-fatal warnings produced by the read side. */
    warnings?: string[];
}
/** Request passed to provider write implementations. */
interface ProviderTransferWriteRequest extends ProviderTransferRequest {
    /** Content stream to write to the provider endpoint. */
    content: TransferDataSource;
    /** Expected total bytes for the content stream when known. */
    totalBytes?: number;
    /** Resume offset for partial writes when supported by the provider. */
    offset?: number;
    /** Verification details from the read side that a writer may preserve or compare. */
    verification?: TransferVerificationResult;
}
/** Result returned by provider write implementations. */
type ProviderTransferWriteResult = TransferExecutionResult;
/** Optional read/write surface exposed by provider sessions that support transfer streaming. */
interface ProviderTransferOperations {
    /** Opens readable content for a provider endpoint. */
    read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> | ProviderTransferReadResult;
    /** Writes readable content to a provider endpoint. */
    write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> | ProviderTransferWriteResult;
}

/**
 * Active provider session contract returned by provider-neutral connections.
 *
 * @module core/TransferSession
 */

/**
 * Connected provider session exposed through {@link TransferClient.connect}.
 */
interface TransferSession<TRaw = unknown> {
    /** Provider backing this session. */
    provider: ProviderId;
    /** Provider capabilities available for this connected session. */
    capabilities: CapabilitySet;
    /** Provider-neutral remote file-system operations. */
    fs: RemoteFileSystem;
    /** Optional provider-backed transfer read/write operations. */
    transfers?: ProviderTransferOperations;
    /** Disconnects and releases provider resources. */
    disconnect(): Promise<void>;
    /** Returns a provider-specific advanced interface when one exists. */
    raw?(): TRaw;
}

/**
 * Provider implementation contracts for ZeroTransfer adapters.
 *
 * @module providers/Provider
 */

/** Provider implementation that can open transfer sessions. */
interface TransferProvider<TSession extends TransferSession = TransferSession> {
    /** Stable provider id. */
    id: ProviderId;
    /** Capabilities advertised by this provider implementation. */
    capabilities: CapabilitySet;
    /** Opens a connected provider session. */
    connect(profile: ConnectionProfile): Promise<TSession>;
}

/**
 * Provider factory contracts used by the provider registry.
 *
 * @module providers/ProviderFactory
 */

/** Factory registered with {@link ProviderRegistry} to create providers on demand. */
interface ProviderFactory<TProvider extends TransferProvider = TransferProvider> {
    /** Provider id created by this factory. */
    id: ProviderId;
    /** Capability snapshot available without opening a network connection. */
    capabilities: CapabilitySet;
    /** Creates an isolated provider instance for a connection attempt. */
    create(): TProvider;
}

/** Mutable registry of provider factories available to a transfer client. */
declare class ProviderRegistry {
    private readonly factories;
    /**
     * Creates a registry and optionally seeds it with provider factories.
     *
     * @param providers - Provider factories to register immediately.
     */
    constructor(providers?: Iterable<ProviderFactory>);
    /**
     * Registers a provider factory.
     *
     * @param provider - Provider factory to add.
     * @returns This registry for fluent setup.
     * @throws {@link ConfigurationError} When a provider id is registered twice.
     */
    register(provider: ProviderFactory): this;
    /**
     * Removes a provider factory from the registry.
     *
     * @param providerId - Provider id to remove.
     * @returns `true` when a provider was removed.
     */
    unregister(providerId: ProviderId): boolean;
    /**
     * Checks whether a provider id is registered.
     *
     * @param providerId - Provider id to inspect.
     * @returns `true` when a provider factory exists.
     */
    has(providerId: ProviderId): boolean;
    /**
     * Gets a provider factory when registered.
     *
     * @param providerId - Provider id to retrieve.
     * @returns The provider factory, or `undefined` when missing.
     */
    get(providerId: ProviderId): ProviderFactory | undefined;
    /**
     * Gets a registered provider factory or throws a typed SDK error.
     *
     * @param providerId - Provider id to retrieve.
     * @returns The registered provider factory.
     * @throws {@link UnsupportedFeatureError} When no provider has been registered.
     */
    require(providerId: ProviderId): ProviderFactory;
    /**
     * Gets a provider capability snapshot when registered.
     *
     * @param providerId - Provider id to inspect.
     * @returns Capability snapshot, or `undefined` when missing.
     */
    getCapabilities(providerId: ProviderId): CapabilitySet | undefined;
    /**
     * Gets a provider capability snapshot or throws a typed SDK error.
     *
     * @param providerId - Provider id to inspect.
     * @returns Capability snapshot for the registered provider.
     * @throws {@link UnsupportedFeatureError} When no provider has been registered.
     */
    requireCapabilities(providerId: ProviderId): CapabilitySet;
    /**
     * Lists registered provider factories in insertion order.
     *
     * @returns Registered provider factories.
     */
    list(): ProviderFactory[];
    /**
     * Lists registered provider capabilities in insertion order.
     *
     * @returns Capability snapshots for every registered provider.
     */
    listCapabilities(): CapabilitySet[];
}

/** Options used to create a provider-neutral transfer client. */
interface TransferClientOptions {
    /** Existing registry to reuse. When omitted, a fresh empty registry is created. */
    registry?: ProviderRegistry;
    /** Provider factories to register with the client registry. */
    providers?: ProviderFactory[];
    /** Structured logger used for client lifecycle records. */
    logger?: ZeroTransferLogger;
}
/** Small provider-neutral client that owns provider lookup and connection setup. */
declare class TransferClient {
    /** Provider registry used by this client. */
    readonly registry: ProviderRegistry;
    private readonly logger;
    /**
     * Creates a transfer client without opening any provider connections.
     *
     * @param options - Optional registry, provider factories, and logger.
     */
    constructor(options?: TransferClientOptions);
    /**
     * Registers a provider factory with this client's registry.
     *
     * @param provider - Provider factory to register.
     * @returns This client for fluent setup.
     */
    registerProvider(provider: ProviderFactory): this;
    /**
     * Checks whether this client can create sessions for a provider id.
     *
     * @param providerId - Provider id to inspect.
     * @returns `true` when a provider factory is registered.
     */
    hasProvider(providerId: ProviderId): boolean;
    /** Lists all registered provider capability snapshots. */
    getCapabilities(): CapabilitySet[];
    /** Gets a specific provider capability snapshot. */
    getCapabilities(providerId: ProviderId): CapabilitySet;
    /**
     * Opens a provider session using `profile.provider`, with `profile.protocol` as compatibility fallback.
     *
     * @param profile - Connection profile containing a provider or legacy protocol field.
     * @returns A connected provider session.
     * @throws {@link ConfigurationError} When neither provider nor protocol is present.
     */
    connect(profile: ConnectionProfile): Promise<TransferSession>;
}

/**
 * Factory for provider-neutral ZeroTransfer clients.
 *
 * @module core/createTransferClient
 */

/**
 * Creates a provider-neutral transfer client.
 *
 * The returned client owns a registry of provider factories and produces
 * `TransferSession` instances on demand via {@link TransferClient.connect}.
 * Registering only the providers you actually use keeps bundle size small
 * (each factory pulls in its own SDK dependencies).
 *
 * @param options - Optional registry, provider factories, and logger.
 * @returns A disconnected {@link TransferClient} instance.
 *
 * @example Multi-provider client
 * ```ts
 * import {
 *   createS3ProviderFactory,
 *   createSftpProviderFactory,
 *   createTransferClient,
 * } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createSftpProviderFactory(), createS3ProviderFactory()],
 * });
 *
 * const session = await client.connect({
 *   host: "sftp.example.com",
 *   provider: "sftp",
 *   username: "deploy",
 *   ssh: { privateKey: { path: "./keys/id_ed25519" } },
 * });
 * try {
 *   const list = await session.fs.list("/uploads");
 *   console.log(list);
 * } finally {
 *   await session.disconnect();
 * }
 * ```
 *
 * @example Friendly one-shot helpers
 * ```ts
 * import { uploadFile } from "@zero-transfer/sdk";
 *
 * await uploadFile({
 *   client,
 *   destination: { path: "/uploads/report.csv", profile },
 *   localPath: "./out/report.csv",
 * });
 * ```
 */
declare function createTransferClient(options?: TransferClientOptions): TransferClient;

/**
 * Shared protocol adapter contract used by the ZeroTransfer facade.
 *
 * Protocol-specific implementations for FTP, FTPS, and SFTP should conform to this
 * interface so high-level client code can remain protocol-neutral.
 *
 * @module protocols/RemoteFileAdapter
 */

/**
 * Minimal remote-file adapter required by the current alpha facade.
 */
interface RemoteFileAdapter {
    /**
     * Opens a remote connection.
     *
     * @param profile - Host, authentication, protocol, timeout, signal, and logger settings.
     * @returns A promise that resolves when the remote session is ready for operations.
     */
    connect(profile: ConnectionProfile): Promise<void>;
    /**
     * Closes the remote connection and releases protocol resources.
     *
     * @returns A promise that resolves when the remote session is fully closed.
     */
    disconnect(): Promise<void>;
    /**
     * Lists entries for a remote directory.
     *
     * @param path - Remote directory path to list.
     * @param options - Optional listing controls such as recursion and abort signal.
     * @returns Normalized remote entries contained by the requested path.
     */
    list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
    /**
     * Reads metadata for a remote entry.
     *
     * @param path - Remote path to inspect.
     * @param options - Optional stat controls such as abort signal.
     * @returns Normalized metadata for an existing remote entry.
     */
    stat(path: string, options?: StatOptions): Promise<RemoteStat>;
}

/**
 * Client facade for the ZeroTransfer SDK foundation.
 *
 * This module intentionally keeps the top-level API small while protocol-specific
 * behavior is delegated to injected adapters. The facade owns lifecycle state,
 * event emission, logging coordination, and common capability discovery.
 *
 * @module client/ZeroTransfer
 */

/**
 * Construction options for a {@link ZeroTransfer} instance.
 *
 * @remarks
 * The adapter option is primarily used by protocol implementations and tests. Until
 * the built-in FTP, FTPS, and SFTP adapters are implemented, callers can inject a
 * compatible adapter to exercise the facade contract.
 */
interface ZeroTransferOptions {
    /** Protocol used when the connection profile does not provide one. */
    protocol?: RemoteProtocol;
    /** Structured logger used for lifecycle and operation records. */
    logger?: ZeroTransferLogger;
    /** Protocol adapter that performs concrete remote file operations. */
    adapter?: RemoteFileAdapter;
}
/**
 * Lightweight capability snapshot for the current client instance.
 */
interface ZeroTransferCapabilities {
    /** The protocol selected for this client facade. */
    protocol: RemoteProtocol;
    /** Whether a concrete protocol adapter has been supplied. */
    adapterReady: boolean;
}
/**
 * SDK entry point for FTP, FTPS, and SFTP workflows.
 *
 * @remarks
 * ZeroTransfer extends Node.js EventEmitter so applications can observe lifecycle
 * events while still using promise-based APIs for operations. The facade is
 * deliberately protocol-neutral; concrete behavior lives behind
 * {@link RemoteFileAdapter}.
 *
 */
declare class ZeroTransfer extends EventEmitter {
    /** Creates a provider-neutral transfer client with the built-in provider registry. */
    static readonly createTransferClient: typeof createTransferClient;
    /** Protocol selected for this client instance. */
    readonly protocol: RemoteProtocol;
    private readonly logger;
    private readonly adapter;
    private connected;
    /**
     * Creates a client facade without opening a network connection.
     *
     * @param options - Optional facade configuration, logger, and protocol adapter.
     */
    constructor(options?: ZeroTransferOptions);
    /**
     * Creates a new client facade using the provided options.
     *
     * @param options - Optional facade configuration, logger, and adapter.
     * @returns A disconnected {@link ZeroTransfer} instance.
     */
    static create(options?: ZeroTransferOptions): ZeroTransfer;
    /**
     * Creates a client and connects it in one step.
     *
     * @param profile - Remote host, authentication, and protocol connection settings.
     * @param options - Optional facade settings that can be overridden by the profile.
     * @returns A connected {@link ZeroTransfer} instance.
     * @throws {@link UnsupportedFeatureError} When no adapter is available for the protocol.
     */
    static connect(profile: ConnectionProfile, options?: ZeroTransferOptions): Promise<ZeroTransfer>;
    /**
     * Opens a remote connection through the configured protocol adapter.
     *
     * @param profile - Remote host, authentication, timeout, logger, and protocol settings.
     * @returns A promise that resolves after the adapter reports a successful connection.
     * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
     */
    connect(profile: ConnectionProfile): Promise<void>;
    /**
     * Closes the active remote connection if one exists.
     *
     * @returns A promise that resolves after the adapter disconnects or immediately when idle.
     */
    disconnect(): Promise<void>;
    /**
     * Checks whether the facade currently considers the adapter connected.
     *
     * @returns `true` after a successful connection and before disconnection.
     */
    isConnected(): boolean;
    /**
     * Describes protocol and adapter readiness for feature discovery.
     *
     * @returns A capability snapshot for diagnostics and UI state.
     */
    getCapabilities(): ZeroTransferCapabilities;
    /**
     * Lists remote entries for a path using the configured adapter.
     *
     * @param path - Remote directory path to inspect.
     * @param options - Optional listing controls such as recursion and abort signal.
     * @returns Normalized remote entries for the requested directory.
     * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
     */
    list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
    /**
     * Reads metadata for a remote path using the configured adapter.
     *
     * @param path - Remote file, directory, or symbolic-link path to inspect.
     * @param options - Optional stat controls such as abort signal.
     * @returns Normalized metadata for an existing remote entry.
     * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
     */
    stat(path: string, options?: StatOptions): Promise<RemoteStat>;
    /**
     * Returns the configured adapter or raises the alpha unsupported-feature error.
     *
     * @returns A concrete remote file adapter ready to execute operations.
     * @throws {@link UnsupportedFeatureError} When no adapter has been provided.
     */
    private requireAdapter;
}

/**
 * MFT route definitions.
 *
 * Routes are named, declarative source→destination policies that bind a pair
 * of {@link ConnectionProfile} values, the paths being moved, and optional
 * filtering metadata. Routes are pure data; the {@link runRoute} executor and
 * the {@link RouteRegistry} wrap them with execution and lookup behavior.
 *
 * @module mft/MftRoute
 */

/** Endpoint inside an MFT route. */
interface MftRouteEndpoint {
    /** Connection profile used to open a provider session for the endpoint. */
    profile: ConnectionProfile;
    /** Provider, remote, or local path the route operates on. */
    path: string;
}
/** Optional filter metadata reserved for tree-aware route execution. */
interface MftRouteFilter {
    /** Glob patterns whose matches should be included. */
    include?: readonly string[];
    /** Glob patterns whose matches should be excluded. */
    exclude?: readonly string[];
}
/** Transfer operations supported by route executors. */
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
/** Declarative source→destination policy bound to provider profiles. */
interface MftRoute {
    /** Stable route identifier. */
    id: string;
    /** Optional human-readable route name. */
    name?: string;
    /** Optional human-readable description. */
    description?: string;
    /** Source endpoint resolved through the transfer client. */
    source: MftRouteEndpoint;
    /** Destination endpoint resolved through the transfer client. */
    destination: MftRouteEndpoint;
    /** Optional include/exclude filter, reserved for tree-aware executors. */
    filter?: MftRouteFilter;
    /** Transfer operation performed by the route. Defaults to `"copy"`. */
    operation?: MftRouteOperation;
    /** Whether the route is enabled. Defaults to `true`. */
    enabled?: boolean;
    /** Caller-defined metadata retained for diagnostics and audit records. */
    metadata?: Record<string, unknown>;
}

/**
 * Route executor that dispatches a single transfer through {@link TransferEngine}.
 *
 * `runRoute` opens both endpoints through the supplied {@link TransferClient},
 * builds a {@link TransferJob} with route correlation metadata, and runs the
 * provider read/write executor under retry, abort, progress, timeout, and
 * bandwidth-limit hooks. Sessions are released in `finally` blocks even when
 * the transfer fails, throws, or is aborted.
 *
 * @module mft/runRoute
 */

/** Options accepted by {@link runRoute}. */
interface RunRouteOptions {
    /** Transfer client whose registry can resolve both endpoint providers. */
    client: TransferClient;
    /** Route to execute. */
    route: MftRoute;
    /** Optional transfer engine override. A fresh engine is created when omitted. */
    engine?: TransferEngine;
    /** Optional explicit job id. Defaults to a deterministic route-derived id. */
    jobId?: string;
    /** Optional clock used to derive the default job id. Defaults to `Date.now`. */
    now?: () => Date;
    /** Abort signal used to cancel the route execution. */
    signal?: AbortSignal;
    /** Retry policy forwarded to the engine. */
    retry?: TransferRetryPolicy;
    /** Progress observer forwarded to the engine. */
    onProgress?: (event: TransferProgressEvent) => void;
    /** Timeout policy forwarded to the engine. */
    timeout?: TransferTimeoutPolicy;
    /** Optional bandwidth limit forwarded to the engine. */
    bandwidthLimit?: TransferBandwidthLimit;
    /** Caller-defined metadata merged into the resulting transfer job. */
    metadata?: Record<string, unknown>;
}

/** Endpoint shape accepted by the friendly helpers. */
interface RemoteFileEndpoint {
    /** Provider profile used to open the session. */
    profile: ConnectionProfile;
    /** Provider, remote, or local path the helper operates on. */
    path: string;
}
/** Shared options consumed by {@link uploadFile}, {@link downloadFile}, and {@link copyBetween}. */
type FriendlyTransferOptions = Omit<RunRouteOptions, "client" | "route"> & {
    /** Stable route id assigned to the synthetic route. Defaults to `"upload:..."`, `"download:..."`, or `"copy:..."`. */
    routeId?: string;
    /** Optional human-readable route name forwarded to telemetry. */
    routeName?: string;
};
/** Options for {@link uploadFile}. */
interface UploadFileOptions extends FriendlyTransferOptions {
    /** Transfer client used to resolve both endpoint providers. */
    client: TransferClient;
    /** Local source path. Relative paths are resolved against `process.cwd()`. */
    localPath: string;
    /** Remote destination endpoint. */
    destination: RemoteFileEndpoint;
}
/**
 * Uploads a single local file to a remote endpoint.
 *
 * The remote provider is resolved from `destination.profile.provider`, so any
 * provider factory you registered with {@link createTransferClient} can be used
 * as the destination.
 *
 * @param options - Friendly upload options.
 * @returns Receipt produced by the underlying transfer engine.
 *
 * @example Upload to SFTP with public-key auth
 * ```ts
 * import {
 *   createSftpProviderFactory,
 *   createTransferClient,
 *   uploadFile,
 * } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createSftpProviderFactory()] });
 *
 * await uploadFile({
 *   client,
 *   destination: {
 *     path: "/uploads/report.csv",
 *     profile: {
 *       host: "sftp.example.com",
 *       provider: "sftp",
 *       username: "deploy",
 *       ssh: { privateKey: { path: "./keys/id_ed25519" } },
 *     },
 *   },
 *   localPath: "./out/report.csv",
 * });
 * ```
 */
declare function uploadFile(options: UploadFileOptions): Promise<TransferReceipt>;
/** Options for {@link downloadFile}. */
interface DownloadFileOptions extends FriendlyTransferOptions {
    /** Transfer client used to resolve both endpoint providers. */
    client: TransferClient;
    /** Remote source endpoint. */
    source: RemoteFileEndpoint;
    /** Local destination path. Relative paths are resolved against `process.cwd()`. */
    localPath: string;
}
/**
 * Downloads a single remote file to a local path.
 *
 * The remote provider is resolved from `source.profile.provider`. The local
 * destination path is created (including parent directories) on demand.
 *
 * @param options - Friendly download options.
 * @returns Receipt produced by the underlying transfer engine.
 *
 * @example Download from S3
 * ```ts
 * import {
 *   createS3ProviderFactory,
 *   createTransferClient,
 *   downloadFile,
 * } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({ providers: [createS3ProviderFactory()] });
 *
 * await downloadFile({
 *   client,
 *   localPath: "./tmp/snapshot.tar.gz",
 *   source: {
 *     path: "snapshots/2026-04-28/snapshot.tar.gz",
 *     profile: {
 *       host: "snapshots", // S3 bucket
 *       provider: "s3",
 *       s3: { region: "us-east-1" },
 *     },
 *   },
 * });
 * ```
 */
declare function downloadFile(options: DownloadFileOptions): Promise<TransferReceipt>;
/** Options for {@link copyBetween}. */
interface CopyBetweenOptions extends FriendlyTransferOptions {
    /** Transfer client used to resolve both endpoint providers. */
    client: TransferClient;
    /** Source remote endpoint. */
    source: RemoteFileEndpoint;
    /** Destination remote endpoint. */
    destination: RemoteFileEndpoint;
}
/**
 * Copies a file between two remote endpoints in a single call.
 *
 * Both source and destination providers must be registered with the
 * {@link TransferClient}. Streams are piped end-to-end without staging the file
 * on the local disk.
 *
 * @param options - Friendly copy options.
 * @returns Receipt produced by the underlying transfer engine.
 *
 * @example Copy from SFTP to S3
 * ```ts
 * import {
 *   copyBetween,
 *   createS3ProviderFactory,
 *   createSftpProviderFactory,
 *   createTransferClient,
 * } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createSftpProviderFactory(), createS3ProviderFactory()],
 * });
 *
 * await copyBetween({
 *   client,
 *   source: {
 *     path: "/exports/daily.csv",
 *     profile: { host: "sftp.example.com", provider: "sftp", username: "etl" },
 *   },
 *   destination: {
 *     path: "warehouse/daily.csv",
 *     profile: { host: "warehouse", provider: "s3", s3: { region: "us-east-1" } },
 *   },
 * });
 * ```
 */
declare function copyBetween(options: CopyBetweenOptions): Promise<TransferReceipt>;

/**
 * Diagnostics helpers for inspecting a {@link TransferClient} and probing connection profiles.
 *
 * These helpers are intentionally side-effect-light: they exercise an existing client without
 * mutating registry state and never log secret material. Use them to render setup screens,
 * collect bug-report payloads, or verify a profile after an importer run.
 *
 * @module diagnostics
 */

/** Snapshot of the providers registered with a client. */
interface ClientDiagnostics {
    /** Providers currently registered, keyed by id. */
    providers: ReadonlyArray<{
        id: ProviderId;
        capabilities: CapabilitySet;
    }>;
}
/**
 * Returns a redaction-safe snapshot of the providers registered with a client.
 *
 * Use this when rendering a setup screen, generating a support bundle, or
 * asserting in tests that the expected provider factories were registered.
 *
 * @param client - Transfer client to inspect.
 * @returns Provider id and capability snapshot tuples.
 *
 * @example List registered providers
 * ```ts
 * import { summarizeClientDiagnostics } from "@zero-transfer/sdk";
 *
 * for (const { id, capabilities } of summarizeClientDiagnostics(client).providers) {
 *   console.log(`${id}: streaming=${capabilities.readStream} resume=${capabilities.resumeDownload}`);
 * }
 * ```
 */
declare function summarizeClientDiagnostics(client: TransferClient): ClientDiagnostics;
/** Per-step duration measurements collected by {@link runConnectionDiagnostics}. */
interface ConnectionDiagnosticTimings {
    /** Total time spent inside `client.connect`. */
    connectMs?: number;
    /** Time spent inside the optional `fs.list` probe. */
    listMs?: number;
    /** Time spent inside the optional `session.disconnect`. */
    disconnectMs?: number;
}
/** Result returned by {@link runConnectionDiagnostics}. */
interface ConnectionDiagnosticsResult {
    /** Resolved provider id used to open the session. */
    provider?: ProviderId;
    /** Profile host (after redaction). */
    host: string;
    /** Capability snapshot reported by the connected session. */
    capabilities?: CapabilitySet;
    /** Redacted connection profile mirroring {@link redactConnectionProfile}. */
    redactedProfile: Record<string, unknown>;
    /** Per-step duration measurements. */
    timings: ConnectionDiagnosticTimings;
    /** Sample of entries returned by the optional `fs.list` probe. */
    sample?: readonly RemoteEntry[];
    /** Whether all probes ran without throwing. */
    ok: boolean;
    /** Captured error summary when the diagnostics could not complete. */
    error?: {
        message: string;
        name?: string;
        code?: string;
    };
}
/** Options accepted by {@link runConnectionDiagnostics}. */
interface RunConnectionDiagnosticsOptions {
    /** Transfer client used to open the session. */
    client: TransferClient;
    /** Connection profile to probe. */
    profile: ConnectionProfile;
    /** Path passed to the optional `fs.list` probe. Defaults to `"/"`. */
    listPath?: string;
    /** When `false`, skips the `fs.list` probe. Defaults to `true`. */
    probeList?: boolean;
    /** Maximum number of entries retained in the result sample. Defaults to `5`. */
    sampleSize?: number;
    /** Optional clock injected for deterministic test timings. Defaults to `performance.now`. */
    now?: () => number;
}
/**
 * Connects to a profile, captures capability and listing samples, and returns a redaction-safe report.
 *
 * Useful for connectivity "ping" pages, smoke tests, and bug reports. Secrets
 * in the profile are redacted via {@link redactConnectionProfile} before being
 * returned. The session is always disconnected before the function returns,
 * including when probes throw.
 *
 * @param options - Diagnostic probe options.
 * @returns Diagnostic report including timings and any captured error.
 *
 * @example Probe an SFTP connection
 * ```ts
 * import { runConnectionDiagnostics } from "@zero-transfer/sdk";
 *
 * const report = await runConnectionDiagnostics({
 *   client,
 *   profile: {
 *     host: "sftp.example.com",
 *     provider: "sftp",
 *     username: "deploy",
 *     ssh: { privateKey: { path: "./keys/id_ed25519" } },
 *   },
 *   listPath: "/uploads",
 * });
 *
 * if (!report.ok) {
 *   console.error("connection failed:", report.error);
 * } else {
 *   console.log(`connect=${report.timings.connectMs}ms list=${report.timings.listMs}ms`);
 *   console.log(report.sample); // up to 5 entries from /uploads
 * }
 * ```
 */
declare function runConnectionDiagnostics(options: RunConnectionDiagnosticsOptions): Promise<ConnectionDiagnosticsResult>;

/** Options for {@link createPooledTransferClient}. */
interface ConnectionPoolOptions {
    /**
     * Maximum number of *idle* sessions retained per pool key.
     *
     * Active leases are not counted against this limit — the cap only applies
     * to sessions waiting in the pool. When more than `maxIdlePerKey` sessions
     * become idle simultaneously, the oldest ones are disconnected. Defaults
     * to `4`.
     */
    maxIdlePerKey?: number;
    /**
     * How long an idle session may sit unused before it is automatically
     * disconnected. Defaults to `60_000` ms. Set to `0` to disable the timer
     * (idle sessions persist until `drainPool()` is called).
     */
    idleTimeoutMs?: number;
    /**
     * Custom pool key derivation. Receives the resolved
     * {@link ConnectionProfile} (after TransferClient validation) and must
     * return a string. Sessions with matching keys are pooled together; never
     * include secrets in the key.
     *
     * The default derives the key from `provider`, `host`, `port`, and
     * `username`.
     */
    keyOf?: (profile: ConnectionProfile) => string;
}
/**
 * Pool-aware {@link TransferClient} returned by
 * {@link createPooledTransferClient}.
 */
interface PooledTransferClient {
    /** Opens (or leases) a pooled provider session. */
    connect(profile: ConnectionProfile): Promise<TransferSession>;
    /** Inspects the registered providers (delegated to the underlying client). */
    hasProvider(providerId: ProviderId): boolean;
    /** Returns the registered capability snapshots (delegated). */
    getCapabilities(): CapabilitySet[];
    /** Returns a specific capability snapshot (delegated). */
    getCapabilities(providerId: ProviderId): CapabilitySet;
    /**
     * Disconnects every idle session and prevents further pooling. After
     * `drainPool()` resolves, subsequent `connect()` calls still work but
     * always create fresh sessions (and never return them to the pool).
     */
    drainPool(): Promise<void>;
    /** Returns the number of idle sessions currently held in the pool. */
    poolSize(): number;
}
/**
 * Wraps a {@link TransferClient} with connection pooling.
 *
 * @param inner - Underlying client used to create real provider sessions.
 * @param options - Pool sizing, eviction, and key-derivation overrides.
 * @returns A {@link PooledTransferClient} that reuses idle sessions.
 */
declare function createPooledTransferClient(inner: TransferClient, options?: ConnectionPoolOptions): PooledTransferClient;

/** Options used to create a local file-system provider factory. */
interface LocalProviderOptions {
    /** Root directory exposed as `/`. When omitted, `profile.host` is treated as the root path. */
    rootPath?: string;
}
/**
 * Creates a provider factory backed by the local filesystem.
 *
 * Useful for copying files between two remote endpoints via a local staging
 * area, or as the destination for `downloadFile`. The friendly `uploadFile`
 * helper registers a local provider implicitly.
 *
 * @param options - Optional local root path exposed through provider sessions.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example Use a fixed root directory
 * ```ts
 * import { createLocalProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createLocalProviderFactory({ rootPath: "/var/lib/zt-staging" })],
 * });
 *
 * const session = await client.connect({ host: "staging", provider: "local" });
 * const list = await session.fs.list("/");
 * ```
 */
declare function createLocalProviderFactory(options?: LocalProviderOptions): ProviderFactory;

/** Fixture entry used to seed a memory provider instance. */
interface MemoryProviderEntry extends Omit<RemoteEntry, "name"> {
    /** Entry basename. When omitted, it is derived from `path`. */
    name?: string;
    /** Optional byte content for file entries. Strings are encoded as UTF-8. */
    content?: string | Uint8Array;
}
/** Options used to create a deterministic memory provider factory. */
interface MemoryProviderOptions {
    /** Entries available to sessions created by this provider factory. */
    entries?: Iterable<MemoryProviderEntry>;
}
/**
 * Creates a provider factory backed by deterministic in-memory fixture entries.
 *
 * Useful for tests and examples where you want a real `TransferSession` without
 * touching disk or the network. Entries are pre-seeded; mutations made through
 * the session are visible to subsequent operations on the same provider.
 *
 * @param options - Optional fixture entries to expose through the memory provider.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 *
 * @example Seed entries and read them back
 * ```ts
 * import { createMemoryProviderFactory, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createMemoryProviderFactory({
 *     entries: [
 *       { path: "/fixtures/hello.txt", content: "hello world" },
 *       { path: "/fixtures/data.bin", content: new Uint8Array([1, 2, 3]) },
 *     ],
 *   })],
 * });
 *
 * const session = await client.connect({ host: "fixtures", provider: "memory" });
 * console.log(await session.fs.list("/fixtures"));
 * ```
 */
declare function createMemoryProviderFactory(options?: MemoryProviderOptions): ProviderFactory;

/**
 * Connection profile redaction helpers.
 *
 * @module profiles/ProfileRedactor
 */

/**
 * Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.
 *
 * @param profile - Connection profile to sanitize.
 * @returns Plain object safe to include in logs, traces, or validation reports.
 */
declare function redactConnectionProfile(profile: ConnectionProfile): Record<string, unknown>;

/**
 * Validates provider-neutral connection profile fields before provider lookup.
 *
 * @param profile - Profile to validate.
 * @returns The original profile when valid.
 * @throws {@link ConfigurationError} When required provider, host, or numeric fields are invalid.
 */
declare function validateConnectionProfile(profile: ConnectionProfile): ConnectionProfile;

/**
 * Connection profile secret resolution helpers.
 *
 * @module profiles/resolveConnectionProfileSecrets
 */

/** SSH profile with private-key and known-host material resolved. */
interface ResolvedSshProfile extends Omit<SshProfile, "knownHosts" | "passphrase" | "privateKey"> {
    /** Resolved private key material. */
    privateKey?: SecretValue;
    /** Resolved private-key passphrase. */
    passphrase?: SecretValue;
    /** Resolved OpenSSH known_hosts material. */
    knownHosts?: SecretValue | SecretValue[];
}
/** TLS profile with certificate-bearing secret sources resolved. */
interface ResolvedTlsProfile extends Omit<TlsProfile, "ca" | "cert" | "key" | "passphrase" | "pfx"> {
    /** Resolved certificate authority bundle. */
    ca?: SecretValue | SecretValue[];
    /** Resolved client certificate PEM. */
    cert?: SecretValue;
    /** Resolved client private key PEM. */
    key?: SecretValue;
    /** Resolved encrypted private-key or PFX/P12 passphrase. */
    passphrase?: SecretValue;
    /** Resolved PFX/P12 client certificate bundle. */
    pfx?: SecretValue;
}
/** Connection profile with username, password, TLS, and SSH material sources resolved. */
interface ResolvedConnectionProfile extends Omit<ConnectionProfile, "password" | "ssh" | "tls" | "username"> {
    /** Resolved username or account identifier. */
    username?: SecretValue;
    /** Resolved password or credential bytes. */
    password?: SecretValue;
    /** Resolved TLS profile when certificate material is configured. */
    tls?: ResolvedTlsProfile;
    /** Resolved SSH profile when private-key material is configured. */
    ssh?: ResolvedSshProfile;
}
/**
 * Resolves credential and TLS material secret sources without mutating the original profile.
 *
 * @param profile - Profile containing optional secret sources.
 * @param options - Optional env and file-reader overrides.
 * @returns Profile copy with username, password, TLS material, and SSH material resolved when present.
 */
declare function resolveConnectionProfileSecrets(profile: ConnectionProfile, options?: ResolveSecretOptions): Promise<ResolvedConnectionProfile>;

/** Token material returned by {@link OAuthRefreshCallback}. */
interface OAuthAccessToken {
    /** Access token value. Required. */
    accessToken: string;
    /**
     * Lifetime in seconds (`expires_in`-style). When provided, the helper caches
     * the token until `now + (expiresInSeconds - skewSeconds)`.
     */
    expiresInSeconds?: number;
    /** Absolute expiry. Wins over `expiresInSeconds` when both are provided. */
    expiresAt?: Date;
}
/** Refresh callback invoked when no valid cached token is available. */
type OAuthRefreshCallback = () => OAuthAccessToken | Promise<OAuthAccessToken>;
/** Options accepted by {@link createOAuthTokenSecretSource}. */
interface OAuthTokenSecretSourceOptions {
    /**
     * Safety margin (in milliseconds) subtracted from the token's expiry to
     * trigger a refresh before the wire deadline. Defaults to `60_000` (60s).
     */
    skewMs?: number;
    /** Clock used to evaluate expiry. Defaults to `Date.now`. */
    now?: () => number;
}
/**
 * Builds a {@link SecretProvider} that exchanges a refresh callback for
 * cached, auto-renewing access tokens.
 *
 * The returned function can be passed directly as `profile.password` for any
 * provider that accepts bearer tokens (Dropbox, Google Drive, OneDrive, GCS,
 * Azure Blob via AAD).
 *
 * @example
 * ```ts
 * const password = createOAuthTokenSecretSource(async () => {
 *   const res = await fetch("https://example.com/oauth/token", { ... });
 *   const body = (await res.json()) as { access_token: string; expires_in: number };
 *   return { accessToken: body.access_token, expiresInSeconds: body.expires_in };
 * });
 * const session = await factory.create().connect({ host: "", protocol: "ftp", password });
 * ```
 */
declare function createOAuthTokenSecretSource(refresh: OAuthRefreshCallback, options?: OAuthTokenSecretSourceOptions): SecretProvider;

/** Marker prefixing a known_hosts line (`@cert-authority` or `@revoked`). */
type KnownHostsMarker = "cert-authority" | "revoked";
/** Parsed entry from an OpenSSH `known_hosts` file. */
interface KnownHostsEntry {
    /** Optional line marker (`@cert-authority` or `@revoked`). */
    marker?: KnownHostsMarker;
    /** Raw, comma-separated host patterns. Negation patterns retain their leading `!`. */
    hostPatterns: readonly string[];
    /** Hashed-salt component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. */
    hashedSalt?: string;
    /** Hashed-hash component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. */
    hashedHash?: string;
    /** SSH key algorithm identifier (e.g. `ssh-ed25519`, `ecdsa-sha2-nistp256`). */
    keyType: string;
    /** Base64-encoded public key blob. */
    keyBase64: string;
    /** Trailing comment text, if any. */
    comment?: string;
    /** Original line text without trailing newline. */
    raw: string;
}
/**
 * Parses OpenSSH `known_hosts` content into structured entries. Comment and blank lines are skipped.
 * Lines that cannot be parsed are silently dropped so callers can tolerate hand-edited files.
 *
 * @param text - Raw `known_hosts` file contents.
 * @returns Parsed entries in source order.
 */
declare function parseKnownHosts(text: string): KnownHostsEntry[];
/**
 * Returns true when the given host (and optional port) matches the entry's host patterns.
 * Hashed entries use HMAC-SHA1 verification per OpenSSH semantics.
 *
 * @param entry - Parsed `known_hosts` entry to test.
 * @param host - Hostname or IP literal to match.
 * @param port - Optional connection port. Defaults to {@link DEFAULT_SSH_PORT}.
 * @returns Whether the entry matches and is not negated.
 */
declare function matchKnownHostsEntry(entry: KnownHostsEntry, host: string, port?: number): boolean;
/**
 * Filters parsed entries down to those that match the given host/port. Negations are honored.
 *
 * @param entries - Entries returned by {@link parseKnownHosts}.
 * @param host - Hostname or IP literal to match.
 * @param port - Optional connection port. Defaults to {@link DEFAULT_SSH_PORT}.
 * @returns Matching entries in source order.
 */
declare function matchKnownHosts(entries: readonly KnownHostsEntry[], host: string, port?: number): KnownHostsEntry[];

/** Parsed `Host` block from an OpenSSH config file. */
interface OpenSshConfigEntry {
    /** Host patterns declared on the `Host` line. */
    patterns: readonly string[];
    /** Lower-cased directive name to ordered values. Multi-valued directives (e.g. `IdentityFile`) preserve order. */
    options: Readonly<Record<string, readonly string[]>>;
}
/**
 * Parses OpenSSH `ssh_config` text into structured `Host` blocks.
 *
 * The parser is intentionally permissive: unknown directives are retained and `Match` blocks are skipped.
 *
 * @param text - Contents of the `ssh_config` file.
 * @returns Parsed `Host` entries in source order.
 */
declare function parseOpenSshConfig(text: string): OpenSshConfigEntry[];
/**
 * Resolved set of directives for a given host alias. Values from later-declared blocks are
 * merged after earlier ones so wildcard fallbacks (e.g. `Host *`) only fill gaps.
 */
interface ResolvedOpenSshHost {
    /** Host alias the lookup was performed against. */
    alias: string;
    /** Per-directive ordered values, keyed by lower-cased directive name. */
    options: Readonly<Record<string, readonly string[]>>;
    /** Source entries that contributed to the resolved set, in match order. */
    matched: readonly OpenSshConfigEntry[];
}
/**
 * Resolves the merged option set for an OpenSSH host alias.
 *
 * @param entries - Parsed entries from {@link parseOpenSshConfig}.
 * @param alias - Host alias to resolve.
 * @returns Merged directive set with the matching entries.
 */
declare function resolveOpenSshHost(entries: readonly OpenSshConfigEntry[], alias: string): ResolvedOpenSshHost;
/** Options accepted by {@link importOpenSshConfig}. */
interface ImportOpenSshConfigOptions {
    /** Raw `ssh_config` text. Either this or {@link entries} must be provided. */
    text?: string;
    /** Pre-parsed entries from {@link parseOpenSshConfig}. */
    entries?: readonly OpenSshConfigEntry[];
    /** Host alias to import. */
    alias: string;
}
/** Result of {@link importOpenSshConfig}. */
interface ImportOpenSshConfigResult {
    /** Generated SFTP connection profile. */
    profile: ConnectionProfile;
    /** Resolved directive set used to build the profile. */
    resolved: ResolvedOpenSshHost;
    /** Identity file paths declared in the config, in declaration order. */
    identityFiles: readonly string[];
    /** Optional `ProxyJump` value preserved from the config. */
    proxyJump?: string;
}
/**
 * Builds a {@link ConnectionProfile} for the given SSH alias from `ssh_config` text or pre-parsed entries.
 *
 * @param options - Import options.
 * @returns Importer result with the generated profile and supporting metadata.
 * @throws {@link ConfigurationError} When neither text nor entries is supplied.
 */
declare function importOpenSshConfig(options: ImportOpenSshConfigOptions): ImportOpenSshConfigResult;

/** Imported FileZilla site with the folder hierarchy that contained it. */
interface FileZillaSite {
    /** Site display name. */
    name: string;
    /** Ordered folder names leading to the site (top-level first). Empty for root sites. */
    folder: readonly string[];
    /** Generated connection profile. */
    profile: ConnectionProfile;
    /** Encoded password value retained from the file, if any. */
    password?: string;
    /** Logon type code preserved from the file (`0`=anonymous, `1`=normal, etc.). */
    logonType?: number;
}
/** Result returned by {@link importFileZillaSites}. */
interface ImportFileZillaSitesResult {
    /** Sites successfully mapped to a connection profile. */
    sites: readonly FileZillaSite[];
    /** Sites that were skipped because their protocol is not supported. */
    skipped: readonly {
        name: string;
        folder: readonly string[];
        protocol?: number;
    }[];
}
/**
 * Parses FileZilla `sitemanager.xml` text and returns generated profiles.
 *
 * @param xml - Contents of `sitemanager.xml`.
 * @returns Imported sites and any skipped entries.
 * @throws {@link ConfigurationError} When the XML root cannot be located.
 */
declare function importFileZillaSites(xml: string): ImportFileZillaSitesResult;

/** Imported WinSCP session entry. */
interface WinScpSession {
    /** Decoded session name (URL-decoded path under the `Sessions\\` namespace). */
    name: string;
    /** Hierarchical path segments derived from the session name (folders separated by `/`). */
    folder: readonly string[];
    /** Generated connection profile. */
    profile: ConnectionProfile;
    /** Raw FSProtocol code preserved from the file. */
    fsProtocol?: number;
    /** Raw Ftps code preserved from the file (`0`=none, `1`=implicit, `2`/`3`=explicit). */
    ftps?: number;
}
/** Result of {@link importWinScpSessions}. */
interface ImportWinScpSessionsResult {
    /** Successfully mapped sessions. */
    sessions: readonly WinScpSession[];
    /** Sessions skipped because their protocol is not supported. */
    skipped: readonly {
        name: string;
        folder: readonly string[];
        fsProtocol?: number;
    }[];
}
/**
 * Parses WinSCP `WinSCP.ini` text and returns generated profiles.
 *
 * @param ini - Contents of the WinSCP configuration file.
 * @returns Imported sessions and any skipped entries.
 * @throws {@link ConfigurationError} When no session sections are found.
 */
declare function importWinScpSessions(ini: string): ImportWinScpSessionsResult;

/**
 * Structured ZeroTransfer error hierarchy.
 *
 * The classes in this module preserve protocol details, retryability, command/path
 * context, and machine-readable codes so application code does not need to parse
 * human error messages.
 *
 * @module errors/ZeroTransferError
 */

/**
 * Complete set of fields required to create a ZeroTransfer error.
 */
interface ZeroTransferErrorDetails {
    /** Stable machine-readable error code. */
    code: string;
    /** Human-readable error message safe to show in logs or diagnostics. */
    message: string;
    /** Original error or exception that caused this error. */
    cause?: unknown;
    /** Protocol active when the error occurred. */
    protocol?: RemoteProtocol;
    /** Remote host associated with the failing operation. */
    host?: string;
    /** Protocol command associated with the failure, if any. */
    command?: string;
    /** FTP response code associated with the failure. */
    ftpCode?: number;
    /** SFTP status code associated with the failure. */
    sftpCode?: number;
    /** Remote path associated with the failure. */
    path?: string;
    /** Whether retry policy may safely retry this failure. */
    retryable: boolean;
    /** Additional structured details for diagnostics. */
    details?: Record<string, unknown>;
}
/**
 * Error construction input for subclasses that provide default codes.
 */
type SpecializedErrorDetails = Omit<ZeroTransferErrorDetails, "code"> & {
    /** Optional override for the subclass default code. */
    code?: string;
};
/**
 * Base class for all typed ZeroTransfer errors.
 */
declare class ZeroTransferError extends Error {
    /** Stable machine-readable error code. */
    readonly code: string;
    /** Protocol active when the error occurred. */
    readonly protocol?: RemoteProtocol;
    /** Remote host associated with the failing operation. */
    readonly host?: string;
    /** Protocol command associated with the failure, if any. */
    readonly command?: string;
    /** FTP response code associated with the failure. */
    readonly ftpCode?: number;
    /** SFTP status code associated with the failure. */
    readonly sftpCode?: number;
    /** Remote path associated with the failure. */
    readonly path?: string;
    /** Whether retry policy may safely retry this failure. */
    readonly retryable: boolean;
    /** Additional structured details for diagnostics. */
    readonly details?: Record<string, unknown>;
    /**
     * Creates a structured SDK error.
     *
     * @param details - Code, message, retryability, and optional protocol context.
     */
    constructor(details: ZeroTransferErrorDetails);
    /**
     * Serializes the error into a plain object suitable for logs or API responses.
     *
     * @returns A JSON-safe object containing public structured error fields.
     */
    toJSON(): Record<string, unknown>;
}
/** Error raised when a remote connection cannot be opened or is lost unexpectedly. */
declare class ConnectionError extends ZeroTransferError {
    /**
     * Creates a connection failure.
     *
     * @param details - Error context with optional host, protocol, and retryability details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when authentication credentials are rejected. */
declare class AuthenticationError extends ZeroTransferError {
    /**
     * Creates an authentication failure.
     *
     * @param details - Error context with optional host, protocol, and command details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when authenticated credentials are not authorized for an operation. */
declare class AuthorizationError extends ZeroTransferError {
    /**
     * Creates an authorization failure.
     *
     * @param details - Error context with optional path and protocol details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when a requested remote path does not exist. */
declare class PathNotFoundError extends ZeroTransferError {
    /**
     * Creates a missing-path failure.
     *
     * @param details - Error context with optional path and protocol details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when a create or rename operation targets an existing path. */
declare class PathAlreadyExistsError extends ZeroTransferError {
    /**
     * Creates an already-exists failure.
     *
     * @param details - Error context with optional path and command details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when the remote server denies access to a path or command. */
declare class PermissionDeniedError extends ZeroTransferError {
    /**
     * Creates a permission failure.
     *
     * @param details - Error context with optional path, command, and protocol details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when an operation exceeds its configured timeout. */
declare class TimeoutError extends ZeroTransferError {
    /**
     * Creates a timeout failure.
     *
     * @param details - Error context with optional duration and retryability details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when an operation is cancelled by an AbortSignal or caller action. */
declare class AbortError extends ZeroTransferError {
    /**
     * Creates an aborted-operation failure.
     *
     * @param details - Error context with optional operation and path details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when a server response violates protocol expectations. */
declare class ProtocolError extends ZeroTransferError {
    /**
     * Creates a protocol failure.
     *
     * @param details - Error context with optional response code and command details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when protocol text or metadata cannot be parsed safely. */
declare class ParseError extends ZeroTransferError {
    /**
     * Creates a parser failure.
     *
     * @param details - Error context with malformed input details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when an upload, download, or stream transfer fails. */
declare class TransferError extends ZeroTransferError {
    /**
     * Creates a transfer failure.
     *
     * @param details - Error context with optional path, bytes, and retryability details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when post-transfer verification fails. */
declare class VerificationError extends ZeroTransferError {
    /**
     * Creates a verification failure.
     *
     * @param details - Error context with checksum, size, or timestamp mismatch details.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when a requested protocol feature is not implemented or unavailable. */
declare class UnsupportedFeatureError extends ZeroTransferError {
    /**
     * Creates an unsupported-feature failure.
     *
     * @param details - Error context describing the missing feature or adapter.
     */
    constructor(details: SpecializedErrorDetails);
}
/** Error raised when user-provided options or paths are invalid before network I/O. */
declare class ConfigurationError extends ZeroTransferError {
    /**
     * Creates a configuration failure.
     *
     * @param details - Error context describing the invalid option or argument.
     */
    constructor(details: SpecializedErrorDetails);
}

/**
 * Protocol error factory helpers.
 *
 * This module translates raw FTP status replies into typed ZeroTransfer errors so
 * adapters can keep protocol parsing separate from application-facing failures.
 *
 * @module errors/errorFactory
 */

/**
 * Input used to map an FTP reply into a structured ZeroTransfer error.
 */
interface FtpReplyErrorInput {
    /** Numeric FTP response code returned by the server. */
    ftpCode: number;
    /** Server-provided response message. */
    message: string;
    /** FTP command that produced the response, if known. */
    command?: string;
    /** Remote path involved in the command, if any. */
    path?: string;
    /** Protocol variant used by the adapter. */
    protocol?: RemoteProtocol;
    /** Original lower-level failure that accompanied the reply. */
    cause?: unknown;
}
/**
 * Maps an FTP reply into the closest typed ZeroTransfer error.
 *
 * @param input - FTP code, message, and optional operation context.
 * @returns A structured error subclass with stable code and retryability metadata.
 */
declare function errorFromFtpReply(input: FtpReplyErrorInput): ZeroTransferError;

/**
 * Secret redaction helpers for logs, events, and diagnostics.
 *
 * These functions focus on preserving useful operational context while removing
 * credentials and command payloads that should not appear in logs.
 *
 * @module logging/redaction
 */
/** Placeholder used when sensitive content has been removed. */
declare const REDACTED = "[REDACTED]";
/**
 * Checks whether an object key is likely to contain sensitive data.
 *
 * @param key - Object key to inspect.
 * @returns `true` when the key name should be redacted.
 */
declare function isSensitiveKey(key: string): boolean;
/**
 * Redacts sensitive FTP command payloads while preserving the command name.
 *
 * @param command - Raw command text such as `PASS secret` or `USER deploy`.
 * @returns Command text with secret arguments replaced by {@link REDACTED}.
 */
declare function redactCommand(command: string): string;
/**
 * Recursively redacts strings, arrays, and plain object values.
 *
 * @param value - Arbitrary value to sanitize for diagnostics.
 * @returns A redacted copy for arrays and objects, or the original primitive value.
 */
declare function redactValue(value: unknown): unknown;
/**
 * Redacts sensitive keys and nested values in a plain object.
 *
 * @param input - Object containing diagnostic fields.
 * @returns A shallow object copy with sensitive fields and nested secrets redacted.
 */
declare function redactObject(input: Record<string, unknown>): Record<string, unknown>;

/** Sleep helper signature used by {@link createBandwidthThrottle}. */
type BandwidthSleep = (delayMs: number, signal?: AbortSignal) => Promise<void>;
/** Construction overrides for deterministic tests. */
interface BandwidthThrottleOptions {
    /** Monotonic clock returning milliseconds since an arbitrary epoch. Defaults to `Date.now`. */
    now?: () => number;
    /** Sleep implementation honoring an optional abort signal. Defaults to a `setTimeout` helper. */
    sleep?: BandwidthSleep;
}
/** Token-bucket throttle used to pace transfer chunks. */
interface BandwidthThrottle {
    /** Maximum sustained transfer rate in bytes per second. */
    readonly bytesPerSecond: number;
    /** Burst capacity in bytes available before throttling kicks in. */
    readonly burstBytes: number;
    /**
     * Consumes `bytes` from the bucket, awaiting refill when not enough tokens are available.
     *
     * @param bytes - Non-negative byte count being released by the throttle.
     * @param signal - Optional abort signal that interrupts pending waits.
     * @throws {@link AbortError} When the signal is aborted while waiting.
     */
    consume(bytes: number, signal?: AbortSignal): Promise<void>;
}
/**
 * Creates a token-bucket throttle that paces an asynchronous data pipeline to
 * a sustained {@link TransferBandwidthLimit}.
 *
 * Returns `undefined` when no limit is supplied so callers can omit throttling
 * without conditional branches at the call site.
 *
 * @param limit - Optional throughput limit. Returns `undefined` when omitted.
 * @param options - Optional clock/sleep overrides for deterministic tests.
 * @returns Throttle implementation when a limit is supplied, otherwise `undefined`.
 * @throws {@link ConfigurationError} When the supplied limit shape is invalid.
 */
declare function createBandwidthThrottle(limit: TransferBandwidthLimit | undefined, options?: BandwidthThrottleOptions): BandwidthThrottle | undefined;
/**
 * Wraps an async iterable of byte chunks so each chunk is released only after
 * the throttle has admitted its byte count.
 *
 * When `throttle` is `undefined`, the source iterable is returned unchanged.
 *
 * @param source - Async iterable that produces byte chunks.
 * @param throttle - Optional throttle that paces chunk emission.
 * @param signal - Optional abort signal interrupting pending waits.
 * @returns Async generator emitting the original chunks at the throttled rate.
 */
declare function throttleByteIterable(source: AsyncIterable<Uint8Array>, throttle: BandwidthThrottle | undefined, signal?: AbortSignal): AsyncIterable<Uint8Array>;

/**
 * Transfer executor bridge for provider-backed read/write sessions.
 *
 * @module transfers/createProviderTransferExecutor
 */

/** Endpoint role used while resolving provider sessions for a transfer job. */
type ProviderTransferEndpointRole = "source" | "destination";
/** Input passed to provider transfer session resolvers. */
interface ProviderTransferSessionResolverInput {
    /** Endpoint being resolved. */
    endpoint: TransferEndpoint;
    /** Whether the endpoint is the source or destination side of the transfer. */
    role: ProviderTransferEndpointRole;
    /** Job currently being executed. */
    job: TransferJob;
}
/** Resolves the connected provider session that owns an endpoint. */
type ProviderTransferSessionResolver = (input: ProviderTransferSessionResolverInput) => TransferSession | undefined;
/** Options for {@link createProviderTransferExecutor}. */
interface ProviderTransferExecutorOptions {
    /** Resolves connected provider sessions for source and destination endpoints. */
    resolveSession: ProviderTransferSessionResolver;
    /** Optional clock/sleep overrides for the bandwidth throttle. */
    throttle?: BandwidthThrottleOptions;
}
/**
 * Creates a {@link TransferExecutor} that reads from a source provider and writes to a destination provider.
 *
 * The returned executor supports single-object `upload`, `download`, and `copy` jobs. Provider sessions must
 * expose `session.transfers.read()` and `session.transfers.write()`; concrete providers remain responsible for
 * the actual streaming implementation.
 *
 * @param options - Session resolver used for source and destination endpoints.
 * @returns Transfer executor suitable for {@link TransferEngine.execute} or {@link TransferQueue}.
 */
declare function createProviderTransferExecutor(options: ProviderTransferExecutorOptions): TransferExecutor;

/**
 * Transfer plan and dry-run primitives.
 *
 * @module transfers/TransferPlan
 */

/** Non-executing plan action used to explain an intentionally skipped step. */
type TransferPlanAction = TransferOperation | "skip";
/** Step inside a transfer plan. */
interface TransferPlanStep {
    /** Stable step identifier within the plan. */
    id: string;
    /** Action the step would perform. */
    action: TransferPlanAction;
    /** Source endpoint when the action reads data. */
    source?: TransferEndpoint;
    /** Destination endpoint when the action writes data. */
    destination?: TransferEndpoint;
    /** Expected bytes affected by the step when known. */
    expectedBytes?: number;
    /** Whether this step may remove or replace data. */
    destructive?: boolean;
    /** Human-readable reason for planned or skipped work. */
    reason?: string;
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/** Input used to create a transfer plan. */
interface TransferPlanInput {
    /** Stable plan identifier. */
    id: string;
    /** Planned steps in execution order. */
    steps: TransferPlanStep[];
    /** Whether the plan is informational only. Defaults to `true`. */
    dryRun?: boolean;
    /** Clock used for deterministic tests. Defaults to `new Date()`. */
    now?: () => Date;
    /** Non-fatal plan warnings. */
    warnings?: string[];
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/** Provider-neutral transfer plan. */
interface TransferPlan {
    /** Stable plan identifier. */
    id: string;
    /** Whether this plan should be treated as a dry run. */
    dryRun: boolean;
    /** Time the plan was created. */
    createdAt: Date;
    /** Planned steps in execution order. */
    steps: TransferPlanStep[];
    /** Non-fatal plan warnings. */
    warnings: string[];
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/** Summary of a transfer plan. */
interface TransferPlanSummary {
    /** Total number of steps. */
    totalSteps: number;
    /** Number of executable steps. */
    executableSteps: number;
    /** Number of skipped steps. */
    skippedSteps: number;
    /** Number of destructive steps. */
    destructiveSteps: number;
    /** Sum of expected bytes for steps that provide sizes. */
    totalExpectedBytes: number;
    /** Counts grouped by action. */
    actions: Record<string, number>;
}
/**
 * Creates a transfer plan from dry-run planning input.
 *
 * Plans are immutable, structured descriptions of intended work. Pair with
 * {@link createSyncPlan} or {@link createAtomicDeployPlan} for end-to-end
 * planning, or build steps by hand when you need full control. Pass the plan
 * to {@link createTransferJobsFromPlan} to materialize executable jobs.
 *
 * @example Build a plan with two upload steps and inspect it
 * ```ts
 * import { createTransferPlan, summarizeTransferPlan } from "@zero-transfer/sdk";
 *
 * const plan = createTransferPlan({
 *   id: "manual-batch",
 *   steps: [
 *     { action: "upload", source: "./a.bin", destination: "/lake/a.bin", expectedBytes: 1024 },
 *     { action: "upload", source: "./b.bin", destination: "/lake/b.bin", expectedBytes: 2048 },
 *   ],
 * });
 *
 * console.table(summarizeTransferPlan(plan));
 * ```
 */
declare function createTransferPlan(input: TransferPlanInput): TransferPlan;
/**
 * Summarizes a transfer plan for diagnostics, previews, and tests.
 *
 * Returns aggregate counts (total / executable / skipped / destructive),
 * total expected bytes, and a per-action histogram. Useful for printing a
 * one-line plan summary before executing or for asserting plan shape in
 * tests.
 *
 * @example Print a plan preview
 * ```ts
 * import { summarizeTransferPlan } from "@zero-transfer/sdk";
 *
 * const summary = summarizeTransferPlan(plan);
 * console.log(`${summary.executableSteps} steps, ${summary.totalExpectedBytes} bytes total`);
 * console.log("Actions:", summary.actions);
 * ```
 */
declare function summarizeTransferPlan(plan: TransferPlan): TransferPlanSummary;
/** Converts executable plan steps into transfer jobs while preserving order. */
declare function createTransferJobsFromPlan(plan: TransferPlan): TransferJob[];

/** Queue item lifecycle state. */
type TransferQueueItemStatus = "queued" | "running" | "completed" | "failed" | "canceled";
/** Resolver used when jobs do not provide an executor at enqueue time. */
type TransferQueueExecutorResolver = (job: TransferJob) => TransferExecutor;
/** Options used to create a transfer queue. */
interface TransferQueueOptions {
    /** Transfer engine used to execute queued jobs. Defaults to a new engine. */
    engine?: TransferEngine;
    /** Maximum jobs to execute at the same time. Defaults to `1`. */
    concurrency?: number;
    /** Default executor used for jobs that do not provide one directly. */
    executor?: TransferExecutor;
    /** Dynamic executor resolver used when no per-job executor or default executor exists. */
    resolveExecutor?: TransferQueueExecutorResolver;
    /** Retry policy passed to engine executions. */
    retry?: TransferRetryPolicy;
    /** Timeout policy passed to engine executions. */
    timeout?: TransferTimeoutPolicy;
    /** Optional throughput limit shape passed to transfer executors. */
    bandwidthLimit?: TransferBandwidthLimit;
    /** Progress observer shared across queued jobs. */
    onProgress?: (event: TransferProgressEvent) => void;
    /** Completion observer for successful jobs. */
    onReceipt?: (receipt: TransferReceipt) => void;
    /** Failure observer for failed jobs. */
    onError?: (item: TransferQueueItem, error: unknown) => void;
}
/** Options used when draining a queue. */
interface TransferQueueRunOptions {
    /** Abort signal used to cancel running jobs during this drain. */
    signal?: AbortSignal;
    /** Retry policy override for this drain. */
    retry?: TransferRetryPolicy;
    /** Timeout policy override for this drain. */
    timeout?: TransferTimeoutPolicy;
    /** Bandwidth limit override for this drain. */
    bandwidthLimit?: TransferBandwidthLimit;
    /** Progress observer override for this drain. */
    onProgress?: (event: TransferProgressEvent) => void;
}
/** Enqueued transfer job state. */
interface TransferQueueItem {
    /** Queued job identifier. */
    id: string;
    /** Original transfer job. */
    job: TransferJob;
    /** Current queue status. */
    status: TransferQueueItemStatus;
    /** Successful transfer receipt when completed. */
    receipt?: TransferReceipt;
    /** Failure or cancellation reason when available. */
    error?: unknown;
}
/** Summary returned after a queue drain. */
interface TransferQueueSummary {
    /** Number of items currently known to the queue. */
    total: number;
    /** Number of successfully completed jobs. */
    completed: number;
    /** Number of failed jobs. */
    failed: number;
    /** Number of canceled jobs. */
    canceled: number;
    /** Number of jobs still queued because the queue was paused. */
    queued: number;
    /** Number of jobs currently running. */
    running: number;
    /** Successful receipts in queue order. */
    receipts: TransferReceipt[];
    /** Failed queue items in queue order. */
    failures: TransferQueueItem[];
}
/**
 * Minimal transfer queue with concurrency, pause/resume, cancellation, and drain summaries.
 *
 * Wrap a {@link TransferEngine} with a queue when you need to run many transfers
 * concurrently with bounded parallelism, observe per-job progress, or drive
 * a UI from a single source of truth. Items are FIFO; failures and successes
 * are surfaced via observers and in the final {@link TransferQueueSummary}.
 *
 * @example Run a batch of uploads with concurrency=4
 * ```ts
 * import {
 *   TransferQueue,
 *   createProviderTransferExecutor,
 * } from "@zero-transfer/sdk";
 *
 * const queue = new TransferQueue({
 *   concurrency: 4,
 *   executor: createProviderTransferExecutor({ client }),
 *   onProgress: (e) => console.log(`${e.jobId}: ${e.bytesTransferred}`),
 *   onError: (item, err) => console.error(`${item.job.id} failed`, err),
 * });
 *
 * for (const file of files) {
 *   queue.enqueue({
 *     id: file.name,
 *     operation: "upload",
 *     source: { profile: localProfile, path: file.path },
 *     destination: { profile: s3Profile, path: `/lake/${file.name}` },
 *   });
 * }
 *
 * const summary = await queue.drain();
 * console.log(`Completed ${summary.completed} / ${summary.total}`);
 * ```
 */
declare class TransferQueue {
    private readonly engine;
    private readonly items;
    private readonly defaultExecutor;
    private readonly resolveExecutor;
    private readonly retry;
    private readonly timeout;
    private readonly bandwidthLimit;
    private readonly onProgress;
    private readonly onReceipt;
    private readonly onError;
    private concurrency;
    private paused;
    /**
     * Creates a transfer queue.
     *
     * @param options - Queue engine, concurrency, executor, and observer options.
     */
    constructor(options?: TransferQueueOptions);
    /** Adds a transfer job to the queue. */
    add(job: TransferJob, executor?: TransferExecutor): TransferQueueItem;
    /** Pauses dispatch of new queued jobs. Running jobs are allowed to finish. */
    pause(): void;
    /** Resumes dispatch of queued jobs on the next `run()` call. */
    resume(): void;
    /** Updates queue concurrency for subsequent drains. */
    setConcurrency(concurrency: number): void;
    /** Cancels a queued or running job. */
    cancel(jobId: string): boolean;
    /** Returns a queued item snapshot by id. */
    get(jobId: string): TransferQueueItem | undefined;
    /** Lists queue item snapshots in insertion order. */
    list(): TransferQueueItem[];
    /** Drains currently queued jobs until complete, failed, canceled, or paused. */
    run(options?: TransferQueueRunOptions): Promise<TransferQueueSummary>;
    /** Returns a queue summary without executing more work. */
    summarize(): TransferQueueSummary;
    private runWorker;
    private nextQueuedItem;
    private runItem;
    private requireExecutor;
    private countDispatchableItems;
}

/**
 * Browser-friendly directory navigation helpers for file-manager UIs.
 *
 * Wraps a {@link RemoteFileSystem} with stateful current-directory tracking,
 * breadcrumb generation, and pure sort/filter utilities so consumers can render
 * directory views without re-implementing common navigation glue.
 *
 * @module sync/createRemoteBrowser
 */

/** Sort key supported by {@link sortRemoteEntries}. */
type RemoteEntrySortKey = "name" | "size" | "modifiedAt" | "type";
/** Sort direction supported by {@link sortRemoteEntries}. */
type RemoteEntrySortOrder = "asc" | "desc";
/** Crumb describing one segment in the current path. */
interface RemoteBreadcrumb {
    /** Display name. `""` is replaced with `"/"` for the root crumb. */
    name: string;
    /** Absolute path the crumb resolves to. */
    path: string;
}
/** Filter callback applied to a directory listing. */
type RemoteBrowserFilter = (entry: RemoteEntry) => boolean;
/** Options accepted by {@link createRemoteBrowser}. */
interface CreateRemoteBrowserOptions {
    /** Remote file system to browse. */
    fs: RemoteFileSystem;
    /** Initial path. Defaults to `"/"`. */
    initialPath?: string;
    /** Sort key applied to listings. Defaults to `"name"`. */
    sortKey?: RemoteEntrySortKey;
    /** Sort order applied to listings. Defaults to `"asc"`. */
    sortOrder?: RemoteEntrySortOrder;
    /** Whether dotfile entries (names starting with `.`) are included. Defaults to `true`. */
    showHidden?: boolean;
    /** Optional filter applied after sort/hidden filtering. */
    filter?: RemoteBrowserFilter;
}
/** Snapshot returned by browser navigation methods. */
interface RemoteBrowserSnapshot {
    /** Current absolute path. */
    path: string;
    /** Directory entries after sorting and filtering. */
    entries: RemoteEntry[];
    /** Breadcrumb trail leading from `/` to {@link path}. */
    breadcrumbs: RemoteBreadcrumb[];
}
/** Stateful directory browser returned by {@link createRemoteBrowser}. */
interface RemoteBrowser {
    /** Current absolute path. */
    readonly path: string;
    /** Last loaded sorted/filtered entries. */
    readonly entries: readonly RemoteEntry[];
    /** Reload the current directory and return the latest snapshot. */
    refresh(): Promise<RemoteBrowserSnapshot>;
    /** Navigate to the supplied absolute or relative path. */
    navigate(target: string): Promise<RemoteBrowserSnapshot>;
    /** Descend into the supplied directory entry. Throws when the entry is not a directory. */
    open(entry: RemoteEntry): Promise<RemoteBrowserSnapshot>;
    /** Move to the parent directory; no-op when already at the root. */
    up(): Promise<RemoteBrowserSnapshot>;
    /** Compute breadcrumbs for the current path without re-listing. */
    breadcrumbs(): RemoteBreadcrumb[];
    /** Update the sort key. The next refresh re-sorts the cached entries. */
    setSort(key: RemoteEntrySortKey, order?: RemoteEntrySortOrder): void;
    /** Toggle hidden-entry visibility. The next refresh re-applies the filter. */
    setShowHidden(showHidden: boolean): void;
}
/**
 * Returns the parent directory of a remote path, or `"/"` for root inputs.
 *
 * @param input - Remote path to inspect.
 * @returns The parent path normalized to an absolute form.
 */
declare function parentRemotePath(input: string): string;
/**
 * Builds breadcrumbs from `/` down to the supplied path.
 *
 * @param input - Absolute remote path.
 * @returns Ordered crumbs starting with the root.
 */
declare function buildRemoteBreadcrumbs(input: string): RemoteBreadcrumb[];
/**
 * Returns a copy of the supplied entries sorted by the requested key. Directories
 * are grouped before files within ascending sorts, matching common file-manager UX.
 *
 * @param entries - Entries to sort.
 * @param key - Sort key.
 * @param order - Sort order.
 * @returns Sorted copy of the entries.
 */
declare function sortRemoteEntries(entries: readonly RemoteEntry[], key?: RemoteEntrySortKey, order?: RemoteEntrySortOrder): RemoteEntry[];
/**
 * Filters entries using the optional predicate plus an optional hidden-file rule.
 *
 * @param entries - Entries to filter.
 * @param options - Filtering controls.
 * @returns Entries matching the supplied rules.
 */
declare function filterRemoteEntries(entries: readonly RemoteEntry[], options?: {
    filter?: RemoteBrowserFilter;
    showHidden?: boolean;
}): RemoteEntry[];
/**
 * Creates a stateful directory browser around a remote file system.
 *
 * The returned browser caches the most recent listing and applies sort/filter
 * settings on each refresh. Navigation methods return a snapshot so UI layers can
 * render synchronously without re-reading state.
 *
 * @param options - Browser configuration.
 * @returns Stateful browser bound to the supplied file system.
 */
declare function createRemoteBrowser(options: CreateRemoteBrowserOptions): RemoteBrowser;

/** Filter callback applied to each visited entry. Returning `false` skips the entry. */
type RemoteTreeFilter = (entry: RemoteEntry) => boolean;
/** Options accepted by {@link walkRemoteTree}. */
interface WalkRemoteTreeOptions {
    /** Whether to descend into subdirectories. Defaults to `true`. */
    recursive?: boolean;
    /** Maximum traversal depth. `0` walks only the root listing. Unbounded by default. */
    maxDepth?: number;
    /** Whether to include directory entries in the output. Defaults to `true`. */
    includeDirectories?: boolean;
    /** Whether to include file entries in the output. Defaults to `true`. */
    includeFiles?: boolean;
    /** Whether to follow symlinks during traversal. Defaults to `false`. */
    followSymlinks?: boolean;
    /** Optional filter applied before yielding and before descending into directories. */
    filter?: RemoteTreeFilter;
    /** Optional abort signal that interrupts traversal between listings. */
    signal?: AbortSignal;
}
/** Walk record yielded by {@link walkRemoteTree}. */
interface RemoteTreeEntry {
    /** Visited remote entry. */
    entry: RemoteEntry;
    /** Zero-based depth relative to the traversal root. */
    depth: number;
    /** Normalized parent directory path. */
    parentPath: string;
}
/**
 * Walks a remote file system depth-first, yielding entries in a stable order.
 *
 * Listings are sorted by entry path within each directory so output is deterministic
 * across providers. Errors thrown by `fs.list()` propagate; callers can supply a
 * filter to skip directories that should not be traversed.
 *
 * @param fs - Remote file system used for listings.
 * @param rootPath - Root directory to walk.
 * @param options - Optional traversal controls.
 * @returns Async generator emitting {@link RemoteTreeEntry} records.
 * @throws {@link AbortError} When the supplied abort signal is cancelled mid-walk.
 */
declare function walkRemoteTree(fs: RemoteFileSystem, rootPath: string, options?: WalkRemoteTreeOptions): AsyncGenerator<RemoteTreeEntry>;

/**
 * Directory diffing primitives that compare two remote trees.
 *
 * @module sync/diffRemoteTrees
 */

/** Outcome category for an entry across the two compared trees. */
type RemoteTreeDiffStatus = "added" | "removed" | "modified" | "unchanged";
/** Reason an entry is considered modified. */
type RemoteTreeDiffReason = "type" | "size" | "modifiedAt" | "checksum";
/** Single diff record produced by {@link diffRemoteTrees}. */
interface RemoteTreeDiffEntry {
    /** Path relative to the traversal root, beginning with `/`. */
    path: string;
    /** Outcome category for this entry. */
    status: RemoteTreeDiffStatus;
    /** Reasons the entry is considered modified. Empty for unchanged/added/removed records. */
    reasons: RemoteTreeDiffReason[];
    /** Source-side entry, when present. */
    source?: RemoteEntry;
    /** Destination-side entry, when present. */
    destination?: RemoteEntry;
}
/** Compact summary of a diff result. */
interface RemoteTreeDiffSummary {
    /** Number of entries present only on the source side. */
    added: number;
    /** Number of entries present only on the destination side. */
    removed: number;
    /** Number of entries present on both sides whose contents differ. */
    modified: number;
    /** Number of entries present on both sides with identical contents. */
    unchanged: number;
    /** Total entries inspected across both sides. */
    total: number;
}
/** Result returned by {@link diffRemoteTrees}. */
interface RemoteTreeDiff {
    /** Diff records sorted by path. */
    entries: RemoteTreeDiffEntry[];
    /** Compact counts for the diff. */
    summary: RemoteTreeDiffSummary;
}
/** Options accepted by {@link diffRemoteTrees}. */
interface DiffRemoteTreesOptions {
    /** Optional traversal controls applied to both sides. */
    walk?: Pick<WalkRemoteTreeOptions, "filter" | "followSymlinks" | "includeDirectories" | "includeFiles" | "maxDepth" | "recursive">;
    /** Filter applied only to the source side. Overrides `walk.filter` when set. */
    sourceFilter?: RemoteTreeFilter;
    /** Filter applied only to the destination side. Overrides `walk.filter` when set. */
    destinationFilter?: RemoteTreeFilter;
    /** Whether unchanged entries are included in `entries`. Defaults to `false`. */
    includeUnchanged?: boolean;
    /** Tolerance in milliseconds when comparing modification timestamps. Defaults to `1000`. */
    modifiedAtToleranceMs?: number;
    /** Whether modification timestamps participate in the comparison. Defaults to `true`. */
    compareModifiedAt?: boolean;
    /** Whether sizes participate in the comparison. Defaults to `true`. */
    compareSize?: boolean;
    /** Whether to require matching `uniqueId` checksums when both entries expose one. Defaults to `false`. */
    compareUniqueId?: boolean;
    /** Optional abort signal threaded through both walks. */
    signal?: AbortSignal;
}
/**
 * Compares two remote subtrees and produces an entry-level diff.
 *
 * Source and destination paths are walked independently; entries are then aligned by
 * the relative path from each tree root. Directory equality is structural — directories
 * are equal when their relative paths match and the entry types agree.
 *
 * @param source - Source-side remote file system.
 * @param sourcePath - Source-side root path being compared.
 * @param destination - Destination-side remote file system.
 * @param destinationPath - Destination-side root path being compared.
 * @param options - Optional comparison controls.
 * @returns Diff result containing entries and a summary.
 *
 * @example Diff two SFTP subtrees and feed the result into createSyncPlan
 * ```ts
 * import { createSyncPlan, diffRemoteTrees } from "@zero-transfer/sdk";
 *
 * const diff = await diffRemoteTrees(
 *   srcSession.fs, "/exports",
 *   dstSession.fs, "/exports",
 *   { compareUniqueId: true },
 * );
 *
 * console.log(diff.summary); // { added, removed, changed, unchanged }
 *
 * const plan = createSyncPlan({
 *   id: "exports-sync",
 *   diff,
 *   source: { provider: "sftp", rootPath: "/exports" },
 *   destination: { provider: "sftp", rootPath: "/exports" },
 * });
 * ```
 */
declare function diffRemoteTrees(source: RemoteFileSystem, sourcePath: string, destination: RemoteFileSystem, destinationPath: string, options?: DiffRemoteTreesOptions): Promise<RemoteTreeDiff>;

/**
 * Sync planning primitives that build a {@link TransferPlan} from a remote-tree diff.
 *
 * @module sync/createSyncPlan
 */

/** Sync direction used by {@link createSyncPlan}. */
type SyncDirection = "source-to-destination" | "destination-to-source";
/** How {@link createSyncPlan} reacts to entries that exist only on the destination. */
type SyncDeletePolicy = 
/** Never delete destination entries that are missing on the source. */
"never"
/** Plan destination deletions when running source-to-destination sync. */
 | "mirror"
/** Plan destination deletions only when paired with a same-path file on the source. */
 | "replace-only";
/** How {@link createSyncPlan} reacts to entries flagged as modified on both sides. */
type SyncConflictPolicy = 
/** Overwrite the destination with the source. */
"overwrite"
/** Overwrite the source with the destination. */
 | "prefer-destination"
/** Skip conflicting entries with a `skip` step. */
 | "skip"
/** Fail planning with a {@link ConfigurationError} when a conflict is encountered. */
 | "error";
/** Endpoint shape supplied to {@link createSyncPlan}. */
interface SyncEndpointInput {
    /** Provider that owns the endpoint when known. */
    provider?: ProviderId;
    /** Root path on the provider being synced. */
    rootPath: string;
}
/** Options accepted by {@link createSyncPlan}. */
interface CreateSyncPlanOptions {
    /** Stable plan identifier. */
    id: string;
    /** Diff produced by {@link diffRemoteTrees} or an equivalent source. */
    diff: RemoteTreeDiff;
    /** Source-side endpoint that produced the diff. */
    source: SyncEndpointInput;
    /** Destination-side endpoint that produced the diff. */
    destination: SyncEndpointInput;
    /** Sync direction. Defaults to `"source-to-destination"`. */
    direction?: SyncDirection;
    /** Delete policy. Defaults to `"never"`. */
    deletePolicy?: SyncDeletePolicy;
    /** Conflict policy. Defaults to `"overwrite"`. */
    conflictPolicy?: SyncConflictPolicy;
    /** Whether to plan upload/download steps for directories. Defaults to `false`. */
    includeDirectoryActions?: boolean;
    /** Whether the plan is informational only. Defaults to `true`. */
    dryRun?: boolean;
    /** Clock used for deterministic tests. Defaults to `new Date()`. */
    now?: () => Date;
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/**
 * Builds a {@link TransferPlan} that reconciles two remote subtrees.
 *
 * Plan steps are derived from a {@link RemoteTreeDiff}; the function does not perform
 * any I/O. Direction, delete policy, and conflict policy control which entries
 * become executable transfers and which become `skip` steps.
 *
 * @param options - Inputs and policies that shape the plan.
 * @returns Transfer plan ready for `createTransferJobsFromPlan` or queue execution.
 * @throws {@link ConfigurationError} When `conflictPolicy: "error"` encounters a conflict.
 *
 * @example Mirror SFTP → S3 with deletes
 * ```ts
 * import {
 *   createSyncPlan,
 *   diffRemoteTrees,
 *   summarizeTransferPlan,
 * } from "@zero-transfer/sdk";
 *
 * const diff = await diffRemoteTrees(
 *   srcSession.fs, "/dist",
 *   dstSession.fs, "/releases/current",
 * );
 *
 * const plan = createSyncPlan({
 *   id: "release-mirror",
 *   diff,
 *   source: { provider: "sftp", rootPath: "/dist" },
 *   destination: { provider: "s3", rootPath: "/releases/current" },
 *   deletePolicy: "mirror",
 *   conflictPolicy: "overwrite",
 * });
 *
 * console.table(summarizeTransferPlan(plan));
 * ```
 */
declare function createSyncPlan(options: CreateSyncPlanOptions): TransferPlan;

/**
 * Atomic deploy planning helpers.
 *
 * Produces a structured plan that stages a release under `<liveRoot>/<releasesDir>/<releaseId>`,
 * activates it via rename or symlink swap, and prunes older releases beyond a retain count.
 *
 * The plan is provider-neutral and execution-free: callers wire the upload {@link TransferPlan}
 * through the transfer engine and execute the activate/prune steps using their provider's
 * filesystem mutation primitives (rename, symlink, delete).
 *
 * @module sync/createAtomicDeployPlan
 */

/** Activation strategy used to swap a staged release into place. */
type AtomicDeployStrategy = 
/** Rename `<liveRoot>` aside, then rename the staging path to `<liveRoot>`. */
"rename"
/** Update a symlink at `<liveRoot>` to point at the staging path. */
 | "symlink";
/** Operation kind for an activation step. */
type AtomicDeployActivateOperation = "rename" | "symlink" | "delete";
/** Kind of activation step described by the plan. */
interface AtomicDeployActivateStep {
    /** Stable identifier within the activation list. */
    id: string;
    /** Operation the step would perform. */
    operation: AtomicDeployActivateOperation;
    /** Source path the operation reads or moves from. */
    fromPath?: string;
    /** Destination path the operation writes to. */
    toPath: string;
    /** Provider identifier that owns the affected paths when known. */
    provider?: ProviderId;
    /** Whether the step replaces or removes data. */
    destructive?: boolean;
    /** Human-readable description for previews and logs. */
    reason: string;
}
/** Pruning step describing an old release directory marked for deletion. */
interface AtomicDeployPruneStep {
    /** Stable identifier within the prune list. */
    id: string;
    /** Absolute release directory path to delete. */
    path: string;
    /** Provider identifier that owns the path when known. */
    provider?: ProviderId;
    /** Reason the release was selected for pruning. */
    reason: string;
}
/** Result returned by {@link createAtomicDeployPlan}. */
interface AtomicDeployPlan {
    /** Stable plan identifier. */
    id: string;
    /** Release identifier embedded into the staging path. */
    releaseId: string;
    /** Activation strategy chosen for the swap. */
    strategy: AtomicDeployStrategy;
    /** Provider identifier for the live destination when known. */
    provider?: ProviderId;
    /** Live target path the release activates onto. */
    livePath: string;
    /** Staging directory the upload populates. */
    stagingPath: string;
    /** Releases root directory under which staging and prior releases live. */
    releasesRoot: string;
    /** Optional backup path used by the rename strategy. */
    backupPath?: string;
    /** Upload plan that populates the staging directory. */
    uploadPlan: TransferPlan;
    /** Activation steps that swap staging into the live path. */
    activate: AtomicDeployActivateStep[];
    /** Prune steps that remove older releases beyond {@link retain}. */
    prune: AtomicDeployPruneStep[];
    /** Number of releases to retain (including the new release). */
    retain: number;
    /** Time the plan was created. */
    createdAt: Date;
    /** Non-fatal plan warnings. */
    warnings: string[];
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/** Options accepted by {@link createAtomicDeployPlan}. */
interface CreateAtomicDeployPlanOptions {
    /** Stable plan identifier. */
    id: string;
    /** Diff describing source vs. staging contents (typically diffed against an empty staging directory). */
    diff: RemoteTreeDiff;
    /** Source-side endpoint feeding the release. */
    source: SyncEndpointInput;
    /** Live destination endpoint the release activates onto. */
    destination: SyncEndpointInput;
    /** Activation strategy. Defaults to `"rename"`. */
    strategy?: AtomicDeployStrategy;
    /** Release identifier. Defaults to a timestamp derived from {@link now}. */
    releaseId?: string;
    /** Releases directory name under the destination root. Defaults to `".releases"`. */
    releasesDirectory?: string;
    /** Number of releases to retain after the new release, including the new one. Defaults to `3`. */
    retain?: number;
    /** Existing release directory paths under the releases root that may be pruned. */
    existingReleases?: string[];
    /** Whether the plan is informational only. Defaults to `true`. */
    dryRun?: boolean;
    /** Clock used for deterministic tests. Defaults to `new Date()`. */
    now?: () => Date;
    /** Caller-defined metadata retained for diagnostics. */
    metadata?: Record<string, unknown>;
}
/**
 * Builds an {@link AtomicDeployPlan} that stages a release, swaps it live, and prunes old releases.
 *
 * The plan describes a blue/green-style deploy:
 *  1. Upload to a timestamped staging directory under `<destination>/.releases/`.
 *  2. Atomically swap the `current` symlink/rename to point at the new release.
 *  3. Optionally prune old releases beyond `retain`.
 *
 * No I/O is performed — the host executes the plan steps. Pair with
 * {@link createTransferPlan} or {@link createTransferJobsFromPlan} to execute.
 *
 * @param options - Inputs and policies that shape the deploy.
 * @returns Structured deploy plan ready for execution by the calling host.
 * @throws {@link ConfigurationError} When `retain` is less than `1` or the destination root is empty.
 *
 * @example Plan a release with rollback path
 * ```ts
 * import { createAtomicDeployPlan } from "@zero-transfer/sdk";
 *
 * const plan = createAtomicDeployPlan({
 *   id: "web-2026-04-28",
 *   source: { rootPath: "./dist" },
 *   destination: {
 *     profile: { host: "web1.example.com", provider: "sftp", username: "deploy" },
 *     rootPath: "/srv/www",
 *   },
 *   retain: 5,
 *   existingReleases: [
 *     "/srv/www/.releases/2026-04-21T00-00-00Z",
 *     "/srv/www/.releases/2026-04-14T00-00-00Z",
 *   ],
 * });
 *
 * console.log(plan.swap);   // staging → current rename
 * console.log(plan.prune);  // releases scheduled for removal
 * ```
 */
declare function createAtomicDeployPlan(options: CreateAtomicDeployPlanOptions): AtomicDeployPlan;

/** Schema version for the manifest payload. Bumped on incompatible format changes. */
declare const REMOTE_MANIFEST_FORMAT_VERSION = 1;
/** Manifest entry recorded for each visited remote node. */
interface RemoteManifestEntry {
    /** Path relative to {@link RemoteManifest.root}, beginning with `/`. */
    path: string;
    /** Entry kind. */
    type: RemoteEntryType;
    /** Entry size in bytes when known. */
    size?: number;
    /** Last modification time as an ISO 8601 timestamp when known. */
    modifiedAt?: string;
    /** Protocol-specific stable identity when available. */
    uniqueId?: string;
    /** Target path for symbolic links when known. */
    symlinkTarget?: string;
}
/** Persisted snapshot of a remote subtree. */
interface RemoteManifest {
    /** Schema version. Must equal {@link REMOTE_MANIFEST_FORMAT_VERSION}. */
    formatVersion: number;
    /** ISO 8601 timestamp recording when the manifest was generated. */
    generatedAt: string;
    /** Normalized absolute root path the manifest snapshot is anchored to. */
    root: string;
    /** Optional provider identifier the snapshot was captured from. */
    provider?: ProviderId;
    /** Manifest entries sorted by path. */
    entries: RemoteManifestEntry[];
}
/** Options accepted by {@link createRemoteManifest}. */
interface CreateRemoteManifestOptions {
    /** Optional traversal controls forwarded to {@link walkRemoteTree}. */
    walk?: Pick<WalkRemoteTreeOptions, "filter" | "followSymlinks" | "includeDirectories" | "includeFiles" | "maxDepth" | "recursive">;
    /** Filter applied during traversal. Overrides `walk.filter` when provided. */
    filter?: RemoteTreeFilter;
    /** Provider identifier embedded into the manifest header. */
    provider?: ProviderId;
    /** Clock used to stamp `generatedAt`. Defaults to `Date.now`. */
    now?: () => Date;
    /** Optional abort signal threaded through the walk. */
    signal?: AbortSignal;
}
/** Options accepted by {@link compareRemoteManifests}. */
interface CompareRemoteManifestsOptions {
    /** Whether unchanged entries are included in the result. Defaults to `false`. */
    includeUnchanged?: boolean;
    /** Tolerance in milliseconds applied to `modifiedAt` comparisons. Defaults to `1000`. */
    modifiedAtToleranceMs?: number;
    /** Whether modification timestamps participate in the comparison. Defaults to `true`. */
    compareModifiedAt?: boolean;
    /** Whether sizes participate in the comparison. Defaults to `true`. */
    compareSize?: boolean;
    /** Whether to require matching `uniqueId` checksums when both entries expose one. Defaults to `false`. */
    compareUniqueId?: boolean;
}
/**
 * Walks a remote subtree and produces a serializable manifest snapshot.
 *
 * @param fs - Remote file system to capture.
 * @param rootPath - Root path the manifest is anchored to.
 * @param options - Optional capture controls.
 * @returns Manifest snapshot suitable for serialization or comparison.
 */
declare function createRemoteManifest(fs: RemoteFileSystem, rootPath: string, options?: CreateRemoteManifestOptions): Promise<RemoteManifest>;
/**
 * Serializes a manifest to a JSON string suitable for persistence.
 *
 * @param manifest - Manifest snapshot to serialize.
 * @param indent - Optional indentation passed to `JSON.stringify`. Defaults to `2`.
 * @returns Stable JSON representation of the manifest.
 */
declare function serializeRemoteManifest(manifest: RemoteManifest, indent?: number): string;
/**
 * Parses a JSON-encoded manifest, validating the schema version and entry shape.
 *
 * @param text - JSON payload produced by {@link serializeRemoteManifest}.
 * @returns Parsed manifest snapshot.
 * @throws {@link ConfigurationError} When the payload is invalid or has an unsupported version.
 */
declare function parseRemoteManifest(text: string): RemoteManifest;
/**
 * Compares two manifests and produces an entry-level diff.
 *
 * The comparison is performed on the relative-path keys recorded inside each manifest;
 * the absolute roots may differ between snapshots (e.g. captured against `/site` on the
 * source and `/var/www/site` on the destination).
 *
 * @param source - Source-side manifest snapshot.
 * @param destination - Destination-side manifest snapshot.
 * @param options - Optional comparison controls.
 * @returns Diff result mirroring {@link RemoteTreeDiff}.
 */
declare function compareRemoteManifests(source: RemoteManifest, destination: RemoteManifest, options?: CompareRemoteManifestsOptions): RemoteTreeDiff;

/**
 * Transfer result and progress calculation helpers.
 *
 * These helpers are pure functions so future FTP, FTPS, and SFTP adapters can share
 * timing, throughput, and progress calculations without coupling to transport code.
 *
 * @module services/TransferService
 */

/**
 * Input used to create a final transfer result.
 */
interface TransferResultInput {
    /** Local or remote source path when known. */
    sourcePath?: string;
    /** Local or remote destination path for the transfer. */
    destinationPath: string;
    /** Total bytes transferred. */
    bytesTransferred: number;
    /** Time the transfer began. */
    startedAt: Date;
    /** Time the transfer completed. */
    completedAt: Date;
    /** Whether the transfer resumed from an earlier partial state. */
    resumed?: boolean;
    /** Whether post-transfer verification succeeded. */
    verified?: boolean;
    /** Optional checksum value produced or verified by the transfer. */
    checksum?: string;
}
/**
 * Input used to create a transfer progress event.
 */
interface ProgressEventInput {
    /** Stable transfer identifier for correlation. */
    transferId: string;
    /** Bytes transferred so far. */
    bytesTransferred: number;
    /** Time the transfer began. */
    startedAt: Date;
    /** Time to use for the progress calculation; defaults to current time. */
    now?: Date;
    /** Total expected bytes when known. */
    totalBytes?: number;
}
/**
 * Creates a final transfer result with duration and average throughput.
 *
 * @param input - Transfer paths, byte count, timestamps, and optional verification metadata.
 * @returns A normalized transfer result.
 */
declare function createTransferResult(input: TransferResultInput): TransferResult;
/**
 * Creates a progress event with elapsed time, rate, and optional percentage.
 *
 * @param input - Transfer id, byte count, start time, optional current time, and total bytes.
 * @returns A normalized transfer progress event.
 */
declare function createProgressEvent(input: ProgressEventInput): TransferProgressEvent;

/**
 * Validates that an FTP command argument cannot inject additional command lines.
 *
 * @param value - Argument value to validate.
 * @param label - Human-readable argument label used in error messages.
 * @returns The original value when it is safe.
 * @throws {@link ConfigurationError} When the value contains CR or LF characters.
 */
declare function assertSafeFtpArgument(value: string, label?: string): string;
/**
 * Normalizes a remote path using POSIX-style separators without escaping absolute roots.
 *
 * @param input - Remote path that may contain duplicate separators or dot segments.
 * @returns A normalized remote path, `/` for absolute root, or `.` for an empty relative path.
 * @throws {@link ConfigurationError} When the input contains unsafe CR or LF characters.
 */
declare function normalizeRemotePath(input: string): string;
/**
 * Joins remote path segments and normalizes the result.
 *
 * @param segments - Remote path segments to concatenate.
 * @returns A normalized remote path.
 * @throws {@link ConfigurationError} When any joined segment contains unsafe characters.
 */
declare function joinRemotePath(...segments: string[]): string;
/**
 * Extracts the final name segment from a normalized remote path.
 *
 * @param input - Remote path to inspect.
 * @returns The final path segment, or `/` when the input is the absolute root.
 * @throws {@link ConfigurationError} When the input contains unsafe characters.
 */
declare function basenameRemotePath(input: string): string;

/**
 * FTPS control-channel TLS mode.
 *
 * `explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
 * `implicit` starts TLS immediately, typically on port 990.
 */
type FtpsMode = "explicit" | "implicit";
/**
 * FTPS data-channel protection level requested after TLS negotiation.
 *
 * `private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
 * `PROT C`, keeping the control channel encrypted while leaving data sockets plain.
 */
type FtpsDataProtection = "clear" | "private";
/**
 * Host selection strategy for PASV data endpoints.
 *
 * `control` connects data sockets back to the control connection host, which avoids
 * broken private or unroutable PASV addresses from NATed servers. `advertised` uses
 * the host supplied by the server's PASV response for deployments that require it.
 */
type FtpPassiveHostStrategy = "advertised" | "control";
/** Options used to create the classic FTP provider factory. */
interface FtpProviderOptions {
    /** Default control port used when a connection profile omits `port`. */
    defaultPort?: number;
    /** PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. */
    passiveHostStrategy?: FtpPassiveHostStrategy;
}
/** Options used to create the FTPS provider factory. */
interface FtpsProviderOptions extends FtpProviderOptions {
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
declare function createFtpProviderFactory(options?: FtpProviderOptions): ProviderFactory;
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
declare function createFtpsProviderFactory(options?: FtpsProviderOptions): ProviderFactory;

/** FTP response status family derived from the first digit of the reply code. */
type FtpResponseStatus = "preliminary" | "completion" | "intermediate" | "transientFailure" | "permanentFailure";
/**
 * Complete parsed FTP response.
 */
interface FtpResponse {
    /** Numeric three-digit FTP reply code. */
    code: number;
    /** Response message with multi-line content joined by newlines. */
    message: string;
    /** Individual message lines without the reply-code prefix. */
    lines: string[];
    /** Raw response lines joined by newlines. */
    raw: string;
    /** Classified response status family. */
    status: FtpResponseStatus;
    /** Whether the response is a 1xx preliminary reply. */
    preliminary: boolean;
    /** Whether the response is a 2xx completion reply. */
    completion: boolean;
    /** Whether the response is a 3xx intermediate reply. */
    intermediate: boolean;
    /** Whether the response is a 4xx transient failure reply. */
    transientFailure: boolean;
    /** Whether the response is a 5xx permanent failure reply. */
    permanentFailure: boolean;
}
/**
 * Stateful parser for socket-delivered FTP response text.
 */
declare class FtpResponseParser {
    private buffer;
    private pendingResponse;
    /**
     * Adds incoming socket data and returns any complete responses.
     *
     * @param chunk - Buffer or string chunk from the FTP control connection.
     * @returns Zero or more complete parsed responses.
     * @throws {@link ParseError} When a malformed standalone response line is received.
     */
    push(chunk: Buffer | string): FtpResponse[];
    /**
     * Clears buffered text and any incomplete multi-line response state.
     *
     * @returns Nothing.
     */
    reset(): void;
    /**
     * Checks whether the parser is holding buffered or incomplete response data.
     *
     * @returns `true` when there is unconsumed text or an open multi-line response.
     */
    hasPendingResponse(): boolean;
    /**
     * Consumes one line of FTP response text.
     *
     * @param rawLine - Line without a trailing CRLF delimiter.
     * @returns A complete response when the line finishes one, otherwise `undefined`.
     * @throws {@link ParseError} When a malformed standalone line is encountered.
     */
    private consumeLine;
}
/**
 * Parses an exact set of response lines into one complete FTP response.
 *
 * @param lines - Raw response lines without trailing newline delimiters.
 * @returns A single complete parsed FTP response.
 * @throws {@link ParseError} When the lines do not contain exactly one complete response.
 */
declare function parseFtpResponseLines(lines: string[]): FtpResponse;

/**
 * FTP FEAT response parser.
 *
 * This module extracts advertised server capabilities and MLST facts from a parsed
 * FTP response, raw response string, or pre-split response lines.
 *
 * @module providers/classic/ftp/FtpFeatureParser
 */

/**
 * Normalized server features returned by an FTP FEAT command.
 */
interface FtpFeatures {
    /** Raw normalized feature lines. */
    raw: string[];
    /** Uppercase feature names for fast lookup. */
    names: Set<string>;
    /** MLST facts advertised by the server, preserving required-fact markers. */
    mlstFacts: string[];
    /**
     * Checks whether a named feature is advertised.
     *
     * @param featureName - Feature name to search for, case-insensitively.
     * @returns `true` when the feature appears in the FEAT response.
     */
    supports(featureName: string): boolean;
}
/**
 * Parses FTP FEAT output into a normalized feature set.
 *
 * @param input - Parsed FTP response, raw string, or individual response lines.
 * @returns Normalized feature names, raw feature lines, and MLST fact names.
 */
declare function parseFtpFeatures(input: FtpResponse | string | string[]): FtpFeatures;

/**
 * Parses an MLSD directory listing into normalized remote entries.
 *
 * @param input - Raw MLSD response body.
 * @param directory - Parent remote directory used to build entry paths.
 * @returns Remote entries excluding the `.` and `..` pseudo entries.
 * @throws {@link ParseError} When any listing line is malformed.
 */
declare function parseMlsdList(input: string, directory?: string): RemoteEntry[];
/**
 * Parses a Unix-style FTP `LIST` response into normalized remote entries.
 *
 * This parser covers the common `ls -l` shape returned by classic FTP daemons and
 * is used as a compatibility fallback when a server does not support MLSD.
 *
 * @param input - Raw LIST response body.
 * @param directory - Parent remote directory used to build entry paths.
 * @param now - Reference date used when LIST entries include time but omit year.
 * @returns Remote entries excluding `.` and `..` pseudo entries.
 * @throws {@link ParseError} When any non-summary listing line is malformed.
 */
declare function parseUnixList(input: string, directory?: string, now?: Date): RemoteEntry[];
/**
 * Parses one Unix-style FTP `LIST` line.
 *
 * @param line - Raw listing line in an `ls -l` compatible format.
 * @param directory - Parent remote directory used to build the entry path.
 * @param now - Reference date used when the line omits a year.
 * @returns Normalized remote entry with raw LIST metadata retained.
 * @throws {@link ParseError} When the line is not a supported Unix LIST entry.
 */
declare function parseUnixListLine(line: string, directory?: string, now?: Date): RemoteEntry;
/**
 * Parses a single MLSD or MLST fact line.
 *
 * @param line - Raw fact line in `fact=value; name` format.
 * @param directory - Parent remote directory used to build the entry path.
 * @returns A normalized remote entry with parsed facts in `raw` metadata.
 * @throws {@link ParseError} When the line does not contain facts and a name.
 */
declare function parseMlsdLine(line: string, directory?: string): RemoteEntry;
/**
 * Parses the UTC timestamp format used by MLST/MLSD `modify` facts.
 *
 * @param input - Timestamp text such as `20260427010203.123`.
 * @returns A UTC Date when the timestamp is valid, otherwise `undefined`.
 */
declare function parseMlstTimestamp(input: string | undefined): Date | undefined;

/** Algorithm lists exchanged during SSH KEXINIT negotiation. */
interface SshAlgorithmPreferences {
    compressionClientToServer: readonly string[];
    compressionServerToClient: readonly string[];
    encryptionClientToServer: readonly string[];
    encryptionServerToClient: readonly string[];
    kexAlgorithms: readonly string[];
    languagesClientToServer: readonly string[];
    languagesServerToClient: readonly string[];
    macClientToServer: readonly string[];
    macServerToClient: readonly string[];
    serverHostKeyAlgorithms: readonly string[];
}
/** Selected algorithms after intersecting client preferences with server capabilities. */
interface NegotiatedSshAlgorithms {
    compressionClientToServer: string;
    compressionServerToClient: string;
    encryptionClientToServer: string;
    encryptionServerToClient: string;
    kexAlgorithm: string;
    languageClientToServer?: string;
    languageServerToClient?: string;
    macClientToServer: string;
    macServerToClient: string;
    serverHostKeyAlgorithm: string;
}

/** Parsed SSH identification components from the RFC 4253 banner line. */
interface SshIdentification {
    protocolVersion: string;
    softwareVersion: string;
    comments?: string;
    raw: string;
}

/** Parsed SSH_MSG_KEXINIT payload. */
interface SshKexInitMessage extends SshAlgorithmPreferences {
    cookie: Buffer$1;
    firstKexPacketFollows: boolean;
    messageType: number;
    reserved: number;
}

/** Directional key material used after SSH NEWKEYS. */
interface SshTransportDirectionKeys {
    encryptionKey: Buffer$1;
    iv: Buffer$1;
    macKey: Buffer$1;
}
/** Session key bundle derived from K, H, and session id. */
interface SshDerivedSessionKeys {
    clientToServer: SshTransportDirectionKeys;
    exchangeHash: Buffer$1;
    serverToClient: SshTransportDirectionKeys;
    sessionId: Buffer$1;
}

/** Initial client-side handshake state before key exchange math starts. */
interface SshTransportHandshakeResult {
    keyExchange: {
        algorithm: string;
        clientKexInitPayload: Buffer$1;
        clientPublicKey: Buffer$1;
        exchangeHash: Buffer$1;
        serverHostKey: Buffer$1;
        serverKexInitPayload: Buffer$1;
        serverPublicKey: Buffer$1;
        serverSignature: Buffer$1;
        sessionId: Buffer$1;
        sharedSecret: Buffer$1;
        transportKeys: {
            clientToServer: SshDerivedSessionKeys["clientToServer"];
            serverToClient: SshDerivedSessionKeys["serverToClient"];
        };
    };
    negotiatedAlgorithms: NegotiatedSshAlgorithms;
    serverIdentification: SshIdentification;
    serverKexInit: SshKexInitMessage;
    /**
     * Number of unencrypted packets the client sent during the handshake (KEXINIT,
     * KEX_ECDH_INIT, NEWKEYS). Per RFC 4253 §6.4, packet sequence numbers are never
     * reset across NEWKEYS, so this value seeds the outbound protector.
     */
    outboundPacketCount: number;
    /**
     * Number of unencrypted packets the client received from the server during the
     * handshake (server KEXINIT, KEX_ECDH_REPLY, NEWKEYS). Seeds the inbound unprotector.
     */
    inboundPacketCount: number;
}

/** Standard SSH disconnect reason codes (RFC 4253 §11.1). */
declare const SshDisconnectReason: {
    readonly HOST_NOT_ALLOWED_TO_CONNECT: 1;
    readonly PROTOCOL_ERROR: 2;
    readonly KEY_EXCHANGE_FAILED: 3;
    readonly MAC_ERROR: 5;
    readonly COMPRESSION_ERROR: 6;
    readonly SERVICE_NOT_AVAILABLE: 7;
    readonly PROTOCOL_VERSION_NOT_SUPPORTED: 8;
    readonly HOST_KEY_NOT_VERIFIABLE: 9;
    readonly CONNECTION_LOST: 10;
    readonly BY_APPLICATION: 11;
    readonly TOO_MANY_CONNECTIONS: 12;
    readonly AUTH_CANCELLED_BY_USER: 13;
    readonly NO_MORE_AUTH_METHODS: 14;
    readonly ILLEGAL_USER_NAME: 15;
};
type SshDisconnectReason = (typeof SshDisconnectReason)[keyof typeof SshDisconnectReason];
interface SshTransportConnectionOptions {
    /** AbortSignal that cancels the in-flight `connect()` call and tears down the socket. */
    abortSignal?: AbortSignal;
    /** Algorithm preference overrides. Defaults to the library defaults. */
    algorithms?: SshAlgorithmPreferences;
    /** SSH software version string embedded in the identification line. */
    clientSoftwareVersion?: string;
    /**
     * Hard cap (milliseconds) on the SSH identification + key exchange + first
     * NEWKEYS handshake. If exceeded the socket is destroyed and `connect()`
     * rejects with a `TimeoutError`. Has no effect once `connect()` resolves.
     */
    handshakeTimeoutMs?: number;
    /**
     * If set, sends a `SSH_MSG_IGNORE` packet every `keepaliveIntervalMs`
     * milliseconds while the transport is connected and idle. This prevents
     * stateful NAT / firewall devices from dropping long-lived idle sessions
     * (e.g. between batches in a transfer queue). The timer is reset on every
     * outbound payload, so active transfers do not generate extra traffic.
     */
    keepaliveIntervalMs?: number;
    /**
     * Synchronous host-key policy hook invoked after the signature on the SSH
     * exchange hash is verified. Throw to reject the server's identity.
     */
    verifyHostKey?: (input: {
        hostKeyBlob: Buffer$1;
        hostKeySha256: Buffer$1;
        algorithmName: string;
    }) => void;
}
/**
 * Live SSH transport connection over a TCP socket.
 *
 * Runs the SSH identification exchange and key exchange handshake on the supplied socket,
 * then provides an encrypted packet send/receive interface for higher-level SSH layers
 * (authentication, connection, SFTP subsystem).
 *
 * Usage:
 * ```ts
 * const conn = new SshTransportConnection();
 * const result = await conn.connect(socket);        // runs handshake
 * conn.sendPayload(payload);                        // post-NEWKEYS send
 * for await (const payload of conn.receivePayloads()) { ... }
 * conn.disconnect();
 * ```
 */
declare class SshTransportConnection {
    private readonly options;
    private connected;
    private disposed;
    private protector;
    private unprotector;
    private socket;
    private keepaliveTimer;
    private readonly inboundQueue;
    /**
     * FIFO of waiters when the queue is empty. Multiple iterators may suspend on
     * the same transport (auth session, channel setup, connection-manager pump);
     * each receives exactly one entry in arrival order. A single-slot field would
     * lose wakeups when a second consumer suspends before the first is resolved.
     */
    private readonly waitingConsumers;
    constructor(options?: SshTransportConnectionOptions);
    /**
     * Runs the SSH handshake on a TCP-connected socket.
     * Resolves when NEWKEYS completes and the transport is ready for encrypted messages.
     * Rejects on socket error, abort, or protocol failure.
     */
    connect(socket: Socket): Promise<SshTransportHandshakeResult>;
    /**
     * Sends an SSH payload over the encrypted transport.
     * The payload must start with the SSH message type byte.
     */
    sendPayload(payload: Buffer$1 | Uint8Array): void;
    /**
     * Async generator that yields inbound SSH payloads (post-NEWKEYS).
     *
     * Transparent handling:
     * - SSH_MSG_IGNORE (2) and SSH_MSG_DEBUG (4) are silently dropped.
     * - SSH_MSG_DISCONNECT (1) from the server throws a `ConnectionError`.
     * - Socket error or close terminates the generator.
     */
    receivePayloads(): AsyncGenerator<Buffer$1>;
    /**
     * Sends SSH_MSG_DISCONNECT and ends the socket.
     * Safe to call multiple times; subsequent calls are no-ops.
     */
    disconnect(reason?: SshDisconnectReason, description?: string): void;
    isConnected(): boolean;
    private onEncryptedData;
    private onSocketError;
    private onSocketClose;
    private enqueueEntry;
    private dequeuePayload;
    private assertConnected;
    private startKeepalive;
    private stopKeepalive;
    private resetKeepaliveTimer;
    private sendKeepalivePing;
}

/**
 * SSH session channel (RFC 4254 §6).
 *
 * Manages a single "session" channel from the client side:
 *   CHANNEL_OPEN → OPEN_CONFIRMATION → CHANNEL_REQUEST (subsystem/exec) →
 *   bidirectional CHANNEL_DATA with window management → CHANNEL_EOF/CLOSE.
 *
 * Window management strategy:
 *   - Local window starts at INITIAL_WINDOW_SIZE.
 *   - When consumed bytes exceed WINDOW_REFILL_THRESHOLD, a WINDOW_ADJUST is sent.
 *   - Outbound data respects the remote window; excess is queued and flushed
 *     as the remote issues WINDOW_ADJUST messages.
 */

interface SshSessionChannelOptions {
    /**
     * Local channel id allocated by the caller.
     * If omitted, defaults to 0 (single-channel use case).
     */
    localChannelId?: number;
}
/**
 * A single SSH session channel.
 * Not safe to share across concurrent callers; each SftpSession should own one.
 */
declare class SshSessionChannel {
    private readonly transport;
    private phase;
    /** Remote channel id assigned by the server in OPEN_CONFIRMATION. */
    private remoteChannelId;
    /** Bytes the remote side can still receive before we must stop sending. */
    private remoteWindowRemaining;
    /** Maximum packet data size the remote accepts. */
    private remoteMaxPacketSize;
    /** Local window: bytes we can still accept from remote. */
    private localWindowConsumed;
    private localWindowSize;
    /** Queue of inbound data for the `receiveData()` generator. */
    private readonly inboundQueue;
    private waitingConsumer;
    /** Queue of outbound data waiting for remote window space. */
    private readonly outboundQueue;
    /**
     * FIFO of waiters blocked on remote window credit. Each WINDOW_ADJUST wakes
     * exactly one waiter; concurrent senders must not lose wakeups.
     */
    private readonly outboundDrainedWaiters;
    /** Serializes sendData() calls so byte order on the wire matches call order. */
    private sendChain;
    private readonly localChannelId;
    constructor(transport: SshTransportConnection, options?: SshSessionChannelOptions);
    /**
     * Opens the channel and requests a subsystem.
     * Resolves once the server confirms both CHANNEL_OPEN and the subsystem request.
     */
    openSubsystem(subsystemName: string): Promise<void>;
    /**
     * Opens the channel and executes a command.
     */
    openExec(command: string): Promise<void>;
    private openChannel;
    private requestSubsystem;
    private requestExec;
    private awaitChannelRequestReply;
    /**
     * Sends data on the channel. Respects the remote window; if there is no space,
     * splits the data and queues the remainder for when WINDOW_ADJUST arrives.
     *
     * Concurrent calls are serialized so wire byte order matches call order.
     */
    sendData(data: Uint8Array): Promise<void>;
    private sendDataLocked;
    /**
     * Async generator that yields raw data buffers from the channel.
     * Returns (done) when the channel receives EOF or CLOSE.
     */
    receiveData(): AsyncGenerator<Buffer$1, void, undefined>;
    /**
     * Sends EOF and CLOSE.  Should be called when the client is done sending.
     */
    close(): void;
    /**
     * Feed an inbound transport payload to this channel.
     * Called by the channel multiplexer (`SshConnectionManager`).
     */
    dispatch(payload: Buffer$1): void;
    dispatchError(error: Error): void;
    private consumeLocalWindow;
    private enqueueInbound;
    private dequeueInbound;
    /** Pull the next payload from the transport (used during channel setup only). */
    private nextPayload;
}

/**
 * SFTP v3 file attribute encoding and decoding (draft-ietf-secsh-filexfer-02 §5).
 *
 * ATTRS flags:
 *   SSH_FILEXFER_ATTR_SIZE        0x00000001
 *   SSH_FILEXFER_ATTR_UIDGID      0x00000002
 *   SSH_FILEXFER_ATTR_PERMISSIONS 0x00000004
 *   SSH_FILEXFER_ATTR_ACMODTIME   0x00000008
 *   SSH_FILEXFER_ATTR_EXTENDED    0x80000000
 */

interface SftpFileAttributes {
    /** File size in bytes. Present when SFTP_ATTR_FLAG.SIZE is set. */
    size?: bigint;
    /** User id. Present when SFTP_ATTR_FLAG.UIDGID is set. */
    uid?: number;
    /** Group id. Present when SFTP_ATTR_FLAG.UIDGID is set. */
    gid?: number;
    /** POSIX file permissions (octal mode). Present when SFTP_ATTR_FLAG.PERMISSIONS is set. */
    permissions?: number;
    /** Access time (seconds since Unix epoch). Present when SFTP_ATTR_FLAG.ACMODTIME is set. */
    atime?: number;
    /** Modification time (seconds since Unix epoch). Present when SFTP_ATTR_FLAG.ACMODTIME is set. */
    mtime?: number;
    /**
     * Extended attributes as key-value pairs.
     * Present when SFTP_ATTR_FLAG.EXTENDED is set.
     */
    extended?: Array<{
        type: string;
        data: Buffer$1;
    }>;
}

/**
 * SFTP v3 request and response message codecs (draft-ietf-secsh-filexfer-02).
 *
 * Each encode function produces the payload bytes that go inside an
 * SSH_FXP_* packet (the type byte and length prefix are added by the framer).
 *
 * Each decode function accepts the full framed packet payload (starting at the
 * byte immediately after the type byte, i.e. at request-id).
 */

interface SftpVersionResponse {
    version: number;
    extensions: Array<{
        name: string;
        data: string;
    }>;
}
/** A single entry returned by SSH_FXP_NAME. */
interface SftpNameEntry {
    filename: string;
    longname: string;
    attrs: SftpFileAttributes;
}

/**
 * SFTP v3 client session (draft-ietf-secsh-filexfer-02).
 *
 * Provides a fully concurrent, typed API over an open SSH session channel.
 * Multiple requests can be in flight simultaneously; each is tracked by its
 * SFTP request id.  Responses are dispatched to the correct awaiter.
 *
 * Lifecycle:
 *   const channel = await connectionManager.openSubsystemChannel("sftp");
 *   const sftp = new SftpSession(channel);
 *   await sftp.init();
 *   const handle = await sftp.open("/path/to/file", SFTP_OPEN_FLAG.READ, {});
 *   const data = await sftp.read(handle, 0n, 4096);
 *   await sftp.close(handle);
 */

declare class SftpSession {
    private readonly channel;
    private nextRequestId;
    private readonly pending;
    private readonly framer;
    /** Resolves on the first packet (VERSION) during init(). */
    private versionWaiter;
    private serverVersion;
    constructor(channel: SshSessionChannel);
    /**
     * Sends SSH_FXP_INIT and awaits SSH_FXP_VERSION.
     * Must be called once before any other operation.
     */
    init(): Promise<SftpVersionResponse>;
    get negotiatedVersion(): number;
    /**
     * Opens a remote file. Returns an opaque handle buffer.
     */
    open(path: string, pflags: number, attrs?: SftpFileAttributes): Promise<Buffer$1>;
    /**
     * Closes a file or directory handle.
     */
    close(handle: Uint8Array): Promise<void>;
    /**
     * Reads up to `length` bytes from `handle` at `offset`.
     * Returns `null` on EOF.
     */
    read(handle: Uint8Array, offset: bigint, length: number): Promise<Buffer$1 | null>;
    /**
     * Writes `data` to `handle` at `offset`.
     */
    write(handle: Uint8Array, offset: bigint, data: Uint8Array): Promise<void>;
    stat(path: string): Promise<SftpFileAttributes>;
    lstat(path: string): Promise<SftpFileAttributes>;
    fstat(handle: Uint8Array): Promise<SftpFileAttributes>;
    setstat(path: string, attrs: SftpFileAttributes): Promise<void>;
    fsetstat(handle: Uint8Array, attrs: SftpFileAttributes): Promise<void>;
    opendir(path: string): Promise<Buffer$1>;
    /**
     * Reads one batch of directory entries.
     * Returns an empty array when the server sends SSH_FX_EOF.
     */
    readdir(handle: Uint8Array): Promise<SftpNameEntry[]>;
    /**
     * Convenience: opens a directory, reads all entries, and closes the handle.
     */
    readdirAll(path: string): Promise<SftpNameEntry[]>;
    remove(path: string): Promise<void>;
    mkdir(path: string, attrs?: SftpFileAttributes): Promise<void>;
    rmdir(path: string): Promise<void>;
    realpath(path: string): Promise<string>;
    rename(oldPath: string, newPath: string): Promise<void>;
    readlink(path: string): Promise<string>;
    symlink(linkPath: string, targetPath: string): Promise<void>;
    private allocRequestId;
    /**
     * Sends raw SFTP message bytes over the channel.
     * The message encoders embed the type byte at position 0, followed by the body.
     * We prefix with a uint32 length so the remote SFTP framer can parse the frame.
     *
     * Send is asynchronous because the underlying SSH channel may apply
     * backpressure when the remote window is exhausted; the channel itself
     * serializes concurrent calls so byte ordering is preserved.
     */
    private sendRaw;
    private pump;
    private dispatchPacket;
    private awaitResponse;
}

/**
 * Options for {@link createNativeSftpProviderFactory}.
 *
 * The native provider is a zero-dependency replacement for the legacy
 * `ssh2`-backed provider. It implements RFC 4253 SSH transport, RFC 4252 user
 * authentication (`password`, `keyboard-interactive`, `publickey` with
 * Ed25519/RSA), RFC 5656 ECDSA host keys (`nistp256/384/521`), and the
 * SFTP v3 client protocol multiplexed over a single channel.
 */
interface NativeSftpProviderOptions {
    /**
     * Default connection timeout in milliseconds when the profile omits
     * `timeoutMs`. Bounds both the TCP connect *and* the SSH identification +
     * key-exchange handshake, so a hung server cannot stall `connect()`
     * indefinitely after the socket is accepted.
     */
    readyTimeoutMs?: number;
    /**
     * Default interval (milliseconds) between SSH-level keepalive pings sent
     * once the transport is connected and idle. Prevents stateful firewalls /
     * NAT devices from dropping long-lived sessions. The timer is reset on
     * every outbound payload so active transfers do not generate extra
     * traffic. Disabled when omitted or `0`.
     */
    keepaliveIntervalMs?: number;
    /**
     * Maximum concurrent file-transfer operations the engine should schedule
     * against a single SFTP session. Each in-flight read/write occupies an
     * outstanding SFTP request slot multiplexed over the same SSH channel; the
     * default of `8` keeps memory bounded on commodity servers, but high-RTT
     * links and modern OpenSSH builds can comfortably handle 16\u201364. Must be
     * a positive integer.
     */
    maxConcurrency?: number;
}
/**
 * Low-level handles exposed by a native SFTP session for diagnostics and
 * advanced extension. Most applications should use the
 * {@link TransferSession} returned from `client.connect()` instead.
 */
interface NativeSftpRawSession {
    /** SFTP v3 client multiplexed over the SSH session channel. */
    sftp: SftpSession;
    /** Underlying SSH transport (key exchange, packet protection, channel mux). */
    transport: SshTransportConnection;
}
/**
 * Creates a {@link ProviderFactory} backed by the native SSH/SFTP protocol
 * stack — no `ssh2` dependency required.
 *
 * **Supported algorithms**
 * - Key exchange: `curve25519-sha256`, `curve25519-sha256@libssh.org`
 * - Host keys: `ssh-ed25519`, `ecdsa-sha2-nistp256/384/521`, `rsa-sha2-256`,
 *   `rsa-sha2-512` (legacy SHA-1 `ssh-rsa` is rejected)
 * - Ciphers: `aes128-ctr`, `aes256-ctr`
 * - MACs: `hmac-sha2-256`, `hmac-sha2-512`
 *
 * **Authentication**
 * - `password`
 * - `keyboard-interactive` (RFC 4256)
 * - `publickey` for Ed25519 and RSA private keys (`rsa-sha2-512` preferred,
 *   `rsa-sha2-256` fallback). Encrypted keys are unlocked via
 *   `profile.ssh.passphrase`.
 *
 * **Host-key verification**
 * - The server's signature over the exchange hash is always verified.
 * - Optional pinning via `profile.ssh.pinnedHostKeySha256` (`SHA256:...`,
 *   raw base64, or hex).
 * - Optional `profile.ssh.knownHosts` (OpenSSH format, hashed and plain
 *   patterns, `[host]:port`, negation, and `@revoked` markers).
 *
 * **Resilience**
 * - `readyTimeoutMs` bounds TCP connect + SSH handshake.
 * - `keepaliveIntervalMs` keeps idle sessions alive through stateful
 *   firewalls / NAT.
 *
 * @example
 * ```ts
 * const client = createTransferClient({
 *   providers: [createNativeSftpProviderFactory({
 *     readyTimeoutMs: 10_000,
 *     keepaliveIntervalMs: 30_000,
 *   })],
 * });
 * const session = await client.connect({
 *   provider: "sftp",
 *   host: "sftp.example.com",
 *   username: "deploy",
 *   ssh: {
 *     privateKey: { kind: "literal", value: process.env.DEPLOY_KEY! },
 *     pinnedHostKeySha256: "SHA256:abc...",
 *   },
 * });
 * ```
 */
declare function createNativeSftpProviderFactory(options?: NativeSftpProviderOptions): ProviderFactory;

export { AbortError, type AtomicDeployActivateOperation, type AtomicDeployActivateStep, type AtomicDeployPlan, type AtomicDeployPruneStep, type AtomicDeployStrategy, type AuthenticationCapability, AuthenticationError, AuthorizationError, type BandwidthSleep, type BandwidthThrottle, type BandwidthThrottleOptions, type Base64EnvSecretSource, type BuiltInProviderId, CLASSIC_PROVIDER_IDS, type CapabilitySet, type ChecksumCapability, type ClassicProviderId, type ClientDiagnostics, type CompareRemoteManifestsOptions, ConfigurationError, type ConnectionDiagnosticTimings, type ConnectionDiagnosticsResult, ConnectionError, type ConnectionPoolOptions, type ConnectionProfile, type CopyBetweenOptions, type CreateAtomicDeployPlanOptions, type CreateRemoteBrowserOptions, type CreateRemoteManifestOptions, type CreateSyncPlanOptions, type DiffRemoteTreesOptions, type DownloadFileOptions, type EnvSecretSource, type FileSecretSource, type FileZillaSite, type FriendlyTransferOptions, type FtpFeatures, type FtpPassiveHostStrategy, type FtpProviderOptions, type FtpReplyErrorInput, type FtpResponse, FtpResponseParser, type FtpResponseStatus, type FtpsDataProtection, type FtpsMode, type FtpsProviderOptions, type ImportFileZillaSitesResult, type ImportOpenSshConfigOptions, type ImportOpenSshConfigResult, type ImportWinScpSessionsResult, type KnownHostsEntry, type KnownHostsMarker, type ListOptions, type LocalProviderOptions, type LogLevel, type LogRecord, type LogRecordInput, type LoggerMethod, type MemoryProviderEntry, type MemoryProviderOptions, type MetadataCapability, type MkdirOptions, type OAuthAccessToken, type OAuthRefreshCallback, type OAuthTokenSecretSourceOptions, type OpenSshConfigEntry, ParseError, PathAlreadyExistsError, PathNotFoundError, PermissionDeniedError, type PooledTransferClient, type ProgressEventInput, ProtocolError, type AuthenticationCapability as ProviderAuthenticationCapability, type CapabilitySet as ProviderCapabilities, type ChecksumCapability as ProviderChecksumCapability, type ProviderFactory, type ProviderId, type MetadataCapability as ProviderMetadataCapability, ProviderRegistry, type ProviderSelection, type ProviderTransferEndpointRole, type ProviderTransferExecutorOptions, type ProviderTransferOperations, type ProviderTransferReadRequest, type ProviderTransferReadResult, type ProviderTransferRequest, type ProviderTransferSessionResolver, type ProviderTransferSessionResolverInput, type ProviderTransferWriteRequest, type ProviderTransferWriteResult, REDACTED, REMOTE_MANIFEST_FORMAT_VERSION, type RemoteBreadcrumb, type RemoteBrowser, type RemoteBrowserFilter, type RemoteBrowserSnapshot, type RemoteEntry, type RemoteEntrySortKey, type RemoteEntrySortOrder, type RemoteEntryType, type RemoteFileAdapter, type RemoteFileEndpoint, type RemoteFileSystem, type RemoteManifest, type RemoteManifestEntry, type RemotePermissions, type RemoteProtocol, type RemoteStat, type RemoteTreeDiff, type RemoteTreeDiffEntry, type RemoteTreeDiffReason, type RemoteTreeDiffStatus, type RemoteTreeDiffSummary, type RemoteTreeEntry, type RemoteTreeFilter, type RemoveOptions, type RenameOptions, type ResolveSecretOptions, type ResolvedConnectionProfile, type ResolvedOpenSshHost, type ResolvedSshProfile, type ResolvedTlsProfile, type RmdirOptions, type RunConnectionDiagnosticsOptions, type SecretProvider, type SecretSource, type SecretValue, type NativeSftpProviderOptions as SftpProviderOptions, type NativeSftpRawSession as SftpRawSession, type SpecializedErrorDetails, type SshAgentSource, type SshAlgorithms, type SshKeyboardInteractiveChallenge, type SshKeyboardInteractiveHandler, type SshKeyboardInteractivePrompt, type SshKnownHostsSource, type SshProfile, type SshSocketFactory, type SshSocketFactoryContext, type StatOptions, type SyncConflictPolicy, type SyncDeletePolicy, type SyncDirection, type SyncEndpointInput, TimeoutError, type TlsProfile, type TlsSecretSource, type TransferAttempt, type TransferAttemptError, type TransferBandwidthLimit, type TransferByteRange, TransferClient, type TransferClientOptions, type TransferDataChunk, type TransferDataSource, type TransferEndpoint, TransferEngine, type TransferEngineExecuteOptions, type TransferEngineOptions, TransferError, type TransferExecutionContext, type TransferExecutionResult, type TransferExecutor, type TransferJob, type TransferOperation, type TransferPlan, type TransferPlanAction, type TransferPlanInput, type TransferPlanStep, type TransferPlanSummary, type TransferProgressEvent, type TransferProvider, TransferQueue, type TransferQueueExecutorResolver, type TransferQueueItem, type TransferQueueItemStatus, type TransferQueueOptions, type TransferQueueRunOptions, type TransferQueueSummary, type TransferReceipt, type TransferResult, type TransferResultInput, type TransferRetryDecisionInput, type TransferRetryPolicy, type TransferSession, type TransferTimeoutPolicy, type TransferVerificationResult, UnsupportedFeatureError, type UploadFileOptions, type ValueSecretSource, VerificationError, type WalkRemoteTreeOptions, type WinScpSession, ZeroTransfer, type ZeroTransferCapabilities, ZeroTransferError, type ZeroTransferErrorDetails, type ZeroTransferLogger, type ZeroTransferOptions, assertSafeFtpArgument, basenameRemotePath, buildRemoteBreadcrumbs, compareRemoteManifests, copyBetween, createAtomicDeployPlan, createBandwidthThrottle, createFtpProviderFactory, createFtpsProviderFactory, createLocalProviderFactory, createMemoryProviderFactory, createOAuthTokenSecretSource, createPooledTransferClient, createProgressEvent, createProviderTransferExecutor, createRemoteBrowser, createRemoteManifest, createNativeSftpProviderFactory as createSftpProviderFactory, createSyncPlan, createTransferClient, createTransferJobsFromPlan, createTransferPlan, createTransferResult, diffRemoteTrees, downloadFile, emitLog, errorFromFtpReply, filterRemoteEntries, importFileZillaSites, importOpenSshConfig, importWinScpSessions, isClassicProviderId, isSensitiveKey, joinRemotePath, matchKnownHosts, matchKnownHostsEntry, noopLogger, normalizeRemotePath, parentRemotePath, parseFtpFeatures, parseFtpResponseLines, parseKnownHosts, parseMlsdLine, parseMlsdList, parseMlstTimestamp, parseOpenSshConfig, parseRemoteManifest, parseUnixList, parseUnixListLine, redactCommand, redactConnectionProfile, redactObject, redactSecretSource, redactValue, resolveConnectionProfileSecrets, resolveOpenSshHost, resolveProviderId, resolveSecret, runConnectionDiagnostics, serializeRemoteManifest, sortRemoteEntries, summarizeClientDiagnostics, summarizeTransferPlan, throttleByteIterable, uploadFile, validateConnectionProfile, walkRemoteTree };
