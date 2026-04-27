/**
 * Provider capability contracts for the provider-neutral ZeroTransfer core.
 *
 * @module core/CapabilitySet
 */
import type { ProviderId } from "./ProviderId";

/** Authentication mechanisms a provider can advertise. */
export type AuthenticationCapability =
  | "anonymous"
  | "password"
  | "private-key"
  | "token"
  | "oauth"
  | "service-account"
  | (string & {});

/** Checksum or integrity mechanisms a provider can advertise. */
export type ChecksumCapability =
  | "crc32"
  | "crc32c"
  | "etag"
  | "md5"
  | "sha1"
  | "sha256"
  | (string & {});

/** Metadata fields a provider can preserve or report. */
export type MetadataCapability =
  | "accessedAt"
  | "createdAt"
  | "group"
  | "mimeType"
  | "modifiedAt"
  | "owner"
  | "permissions"
  | "storageClass"
  | "symlinkTarget"
  | "tags"
  | "uniqueId"
  | (string & {});

/**
 * Capability snapshot advertised by a provider factory and active session.
 */
export interface CapabilitySet {
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
