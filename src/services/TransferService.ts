/**
 * Transfer result and progress calculation helpers.
 *
 * These helpers are pure functions so future FTP, FTPS, and SFTP adapters can share
 * timing, throughput, and progress calculations without coupling to transport code.
 *
 * @module services/TransferService
 */
import type { TransferProgressEvent, TransferResult } from "../types/public";

/**
 * Input used to create a final transfer result.
 */
export interface TransferResultInput {
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
export interface ProgressEventInput {
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
export function createTransferResult(input: TransferResultInput): TransferResult {
  const durationMs = Math.max(0, input.completedAt.getTime() - input.startedAt.getTime());
  const result: TransferResult = {
    destinationPath: input.destinationPath,
    bytesTransferred: input.bytesTransferred,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    durationMs,
    averageBytesPerSecond: calculateBytesPerSecond(input.bytesTransferred, durationMs),
    resumed: input.resumed ?? false,
    verified: input.verified ?? false,
  };

  if (input.sourcePath !== undefined) result.sourcePath = input.sourcePath;
  if (input.checksum !== undefined) result.checksum = input.checksum;

  return result;
}

/**
 * Creates a progress event with elapsed time, rate, and optional percentage.
 *
 * @param input - Transfer id, byte count, start time, optional current time, and total bytes.
 * @returns A normalized transfer progress event.
 */
export function createProgressEvent(input: ProgressEventInput): TransferProgressEvent {
  const now = input.now ?? new Date();
  const elapsedMs = Math.max(0, now.getTime() - input.startedAt.getTime());
  const event: TransferProgressEvent = {
    transferId: input.transferId,
    bytesTransferred: input.bytesTransferred,
    startedAt: input.startedAt,
    elapsedMs,
    bytesPerSecond: calculateBytesPerSecond(input.bytesTransferred, elapsedMs),
  };

  if (input.totalBytes !== undefined) {
    event.totalBytes = input.totalBytes;
    event.percent = input.totalBytes > 0 ? (input.bytesTransferred / input.totalBytes) * 100 : 0;
  }

  return event;
}

/**
 * Calculates average throughput for a byte count and duration.
 *
 * @param bytes - Number of bytes transferred.
 * @param durationMs - Transfer duration in milliseconds.
 * @returns Average bytes per second, falling back to bytes for zero-duration samples.
 */
function calculateBytesPerSecond(bytes: number, durationMs: number): number {
  if (durationMs <= 0) {
    return bytes;
  }

  return bytes / (durationMs / 1000);
}
