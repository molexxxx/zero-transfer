/**
 * Transfer job and receipt contracts used by the transfer engine foundation.
 *
 * @module transfers/TransferJob
 */
import type { ProviderId } from "../core/ProviderId";

/** Provider-neutral transfer operation names. */
export type TransferOperation =
  | "copy"
  | "delete"
  | "download"
  | "move"
  | "sync"
  | "upload"
  | (string & {});

/** Endpoint referenced by a transfer job or receipt. */
export interface TransferEndpoint {
  /** Provider that owns the endpoint when known. */
  provider?: ProviderId;
  /** Provider, remote, or local path for the endpoint. */
  path: string;
}

/** Transfer job input consumed by {@link TransferEngine}. */
export interface TransferJob {
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

/** Result returned by a transfer operation implementation. */
export interface TransferExecutionResult {
  /** Bytes transferred by the completed operation. */
  bytesTransferred: number;
  /** Total expected bytes when discovered during execution. */
  totalBytes?: number;
  /** Whether the operation resumed prior partial work. */
  resumed?: boolean;
  /** Whether post-transfer verification completed successfully. */
  verified?: boolean;
  /** Optional checksum value produced or verified by the operation. */
  checksum?: string;
  /** Non-fatal warnings produced during execution. */
  warnings?: string[];
}

/** Serializable error summary retained in failed attempts. */
export interface TransferAttemptError {
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
export interface TransferAttempt {
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
export interface TransferReceipt {
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
  /** Optional checksum value produced or verified by the operation. */
  checksum?: string;
  /** Attempt history, including retry failures. */
  attempts: TransferAttempt[];
  /** Non-fatal warnings produced during execution. */
  warnings: string[];
  /** Caller-defined metadata retained from the job. */
  metadata?: Record<string, unknown>;
}
