/**
 * Structured logging contracts and helpers for ZeroFTP.
 *
 * The logger shape is intentionally compatible with popular structured loggers while
 * staying small enough for applications to implement directly.
 *
 * @module logging/Logger
 */
/** Supported ZeroFTP log levels. */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

/**
 * Complete structured log record emitted by ZeroFTP helpers.
 */
export interface LogRecord {
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
export interface LogRecordInput extends Omit<LogRecord, "level"> {
  /** Human-readable summary message. */
  message: string;
}

/**
 * Logger method signature used for each severity level.
 *
 * @param record - Structured log record.
 * @param message - Convenience message argument for console-like loggers.
 */
export type LoggerMethod = (record: LogRecord, message?: string) => void;

/**
 * Partial structured logger accepted by ZeroFTP.
 */
export interface ZeroFTPLogger {
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
export const noopLogger: Required<ZeroFTPLogger> = {
  trace() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
};

/**
 * Emits a structured log record if the logger implements the requested level.
 *
 * @param logger - Logger that may contain a method for the requested level.
 * @param level - Severity level to emit.
 * @param record - Log record fields without the level property.
 * @returns Nothing; missing logger methods are ignored.
 */
export function emitLog(logger: ZeroFTPLogger, level: LogLevel, record: LogRecordInput): void {
  const method = logger[level];

  if (method === undefined) {
    return;
  }

  const logRecord: LogRecord = {
    ...record,
    level,
  };

  method(logRecord, logRecord.message);
}
