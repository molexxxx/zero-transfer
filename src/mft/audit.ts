/**
 * MFT audit log primitives and immutable receipt wrapping.
 *
 * Audit entries are append-only records of route lifecycle events. They wrap a
 * frozen copy of the originating {@link TransferReceipt} (when present) so
 * downstream consumers can rely on the receipt being immutable. The
 * {@link InMemoryAuditLog} suits unit tests and short-lived processes;
 * {@link createJsonlAuditLog} streams entries as newline-delimited JSON to a
 * caller-provided writer for durable logs.
 *
 * @module mft/audit
 */
import type { TransferReceipt } from "../transfers/TransferJob";

/** Discriminator describing the lifecycle event being recorded. */
export type MftAuditEntryType = "fire" | "result" | "error";

/** Audit record emitted by route execution. */
export interface MftAuditEntry {
  /** Stable record id. */
  id: string;
  /** Wall-clock time at which the entry was created. */
  recordedAt: Date;
  /** Event type discriminator. */
  type: MftAuditEntryType;
  /** Route id correlated with the entry. */
  routeId: string;
  /** Schedule id when the event originated from a scheduled fire. */
  scheduleId?: string;
  /** Frozen receipt for `result` entries. */
  receipt?: Readonly<TransferReceipt>;
  /** Serialized error details for `error` entries. */
  error?: { message: string; name?: string; code?: string };
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Append-only audit log surface. */
export interface MftAuditLog {
  /** Records a new audit entry. */
  record(entry: MftAuditEntry): Promise<void>;
  /** Returns recorded entries in insertion order. */
  list(): Promise<readonly MftAuditEntry[]>;
}

/** In-memory implementation of {@link MftAuditLog}. */
export class InMemoryAuditLog implements MftAuditLog {
  private readonly entries: MftAuditEntry[] = [];

  /** Records a new audit entry. */
  record(entry: MftAuditEntry): Promise<void> {
    this.entries.push(entry);
    return Promise.resolve();
  }

  /** Returns recorded entries in insertion order. */
  list(): Promise<readonly MftAuditEntry[]> {
    return Promise.resolve([...this.entries]);
  }

  /** Drops all recorded entries. */
  clear(): void {
    this.entries.length = 0;
  }

  /** Number of currently recorded entries. */
  get size(): number {
    return this.entries.length;
  }
}

/** Output sink consumed by {@link createJsonlAuditLog}. */
export interface JsonlWriter {
  /** Writes a UTF-8 line that already includes a trailing newline. */
  write(line: string): Promise<void>;
}

/**
 * Creates an audit log that streams records as newline-delimited JSON.
 *
 * `list()` is not supported by the JSONL writer because the durable form is
 * append-only on disk. Callers that need to read back entries should pair the
 * JSONL log with an {@link InMemoryAuditLog} via {@link composeAuditLogs}.
 *
 * @param writer - Sink that receives one JSON line per record.
 * @returns A log that writes JSONL on every `record` call.
 */
export function createJsonlAuditLog(writer: JsonlWriter): MftAuditLog {
  return {
    list: () => Promise.resolve([]),
    record: async (entry) => {
      await writer.write(`${JSON.stringify(serializeEntry(entry))}\n`);
    },
  };
}

/**
 * Combines multiple audit logs into a single fan-out log.
 *
 * @param logs - Logs that should each receive every recorded entry.
 * @returns A composite log whose `record` writes to all targets in order and
 *          whose `list` returns the first non-empty result.
 */
export function composeAuditLogs(...logs: readonly MftAuditLog[]): MftAuditLog {
  return {
    list: async () => {
      for (const log of logs) {
        const entries = await log.list();
        if (entries.length > 0) return entries;
      }
      return [];
    },
    record: async (entry) => {
      for (const log of logs) {
        await log.record(entry);
      }
    },
  };
}

/**
 * Returns a deeply frozen copy of a transfer receipt.
 *
 * @param receipt - Receipt to freeze.
 * @returns Read-only copy safe to retain in audit records.
 */
export function freezeReceipt(receipt: TransferReceipt): Readonly<TransferReceipt> {
  return deepFreeze(structuredCloneOrJson(receipt));
}

/**
 * Serializes an unknown error into the audit-friendly `{ message, name, code }` shape.
 *
 * @param error - Error value thrown by the route runner.
 * @returns A plain object suitable for {@link MftAuditEntry.error}.
 */
export function summarizeError(error: unknown): { message: string; name?: string; code?: string } {
  if (error instanceof Error) {
    const summary: { message: string; name?: string; code?: string } = { message: error.message };
    if (error.name !== "Error") summary.name = error.name;
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") summary.code = code;
    return summary;
  }
  return { message: typeof error === "string" ? error : String(error) };
}

function serializeEntry(entry: MftAuditEntry): MftAuditEntry {
  return entry;
}

function structuredCloneOrJson<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) {
    const child = (value as Record<string, unknown>)[key];
    if (child !== null && typeof child === "object" && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }
  return value;
}
