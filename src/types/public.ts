/**
 * Public data contracts shared by the ZeroFTP facade, adapters, and services.
 *
 * These types are intentionally protocol-neutral so FTP, FTPS, and SFTP adapters can
 * report the same metadata, transfer, and connection shapes to application code.
 *
 * @module types/public
 */
import type { ZeroFTPLogger } from "../logging/Logger";
import type { ClassicProviderId, ProviderId } from "../core/ProviderId";
import type { SecretSource } from "../profiles/SecretSource";

/** Supported remote file-transfer protocols. */
export type RemoteProtocol = ClassicProviderId;

/** Normalized remote entry kinds returned by listing and metadata operations. */
export type RemoteEntryType = "file" | "directory" | "symlink" | "unknown";

/**
 * Portable permission metadata for a remote entry.
 */
export interface RemotePermissions {
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
export interface RemoteEntry {
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
export interface RemoteStat extends RemoteEntry {
  /** Existence discriminator for successful stat operations. */
  exists: true;
}

/**
 * Connection settings accepted by facade and adapter implementations.
 */
export interface ConnectionProfile {
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
  /** Operation or connection timeout in milliseconds. */
  timeoutMs?: number;
  /** Abort signal used to cancel connection setup or long-running operations. */
  signal?: AbortSignal;
  /** Per-profile logger override. */
  logger?: ZeroFTPLogger;
}

/**
 * Options for remote directory listing operations.
 */
export interface ListOptions {
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
export interface StatOptions {
  /** Abort signal used to cancel the metadata operation. */
  signal?: AbortSignal;
}

/**
 * Progress snapshot emitted while a transfer is running.
 */
export interface TransferProgressEvent {
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
export interface TransferResult {
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
