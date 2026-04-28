import { describe, expect, it } from "vitest";
import {
  InMemoryAuditLog,
  composeAuditLogs,
  createJsonlAuditLog,
  freezeReceipt,
  summarizeError,
  type JsonlWriter,
  type MftAuditEntry,
  type TransferReceipt,
} from "../../../src/index";

const baseDate = new Date("2026-04-28T00:00:00.000Z");

function createReceipt(): TransferReceipt {
  return {
    attempts: [
      {
        attempt: 1,
        bytesTransferred: 10,
        completedAt: baseDate,
        durationMs: 5,
        startedAt: baseDate,
      },
    ],
    averageBytesPerSecond: 0,
    bytesTransferred: 10,
    completedAt: baseDate,
    destination: { path: "/out", provider: "memory" },
    durationMs: 5,
    jobId: "job-1",
    operation: "copy",
    resumed: false,
    source: { path: "/in", provider: "memory" },
    startedAt: baseDate,
    transferId: "job-1",
    verified: false,
    warnings: [],
  };
}

function createEntry(overrides: Partial<MftAuditEntry> = {}): MftAuditEntry {
  return {
    id: "entry-1",
    recordedAt: baseDate,
    routeId: "route-1",
    type: "fire",
    ...overrides,
  };
}

describe("InMemoryAuditLog", () => {
  it("records and lists entries in insertion order", async () => {
    const log = new InMemoryAuditLog();

    await log.record(createEntry({ id: "a" }));
    await log.record(createEntry({ id: "b", type: "result" }));

    const entries = await log.list();
    expect(entries.map((entry) => entry.id)).toEqual(["a", "b"]);
    expect(log.size).toBe(2);

    log.clear();
    expect(log.size).toBe(0);
  });
});

describe("createJsonlAuditLog", () => {
  it("streams JSON lines through the writer", async () => {
    const lines: string[] = [];
    const writer: JsonlWriter = { write: (line) => Promise.resolve(void lines.push(line)) };
    const log = createJsonlAuditLog(writer);

    await log.record(createEntry({ receipt: freezeReceipt(createReceipt()) }));

    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]?.trim() ?? "") as {
      id: string;
      recordedAt: string;
      type: string;
      receipt: { bytesTransferred: number };
    };
    expect(parsed).toMatchObject({
      id: "entry-1",
      recordedAt: "2026-04-28T00:00:00.000Z",
      type: "fire",
    });
    expect(parsed.receipt.bytesTransferred).toBe(10);
    expect(await log.list()).toEqual([]);
  });
});

describe("composeAuditLogs", () => {
  it("fans out records and reads from the first non-empty log", async () => {
    const memory = new InMemoryAuditLog();
    const lines: string[] = [];
    const jsonl = createJsonlAuditLog({
      write: (line) => Promise.resolve(void lines.push(line)),
    });
    const composed = composeAuditLogs(jsonl, memory);

    await composed.record(createEntry());
    expect(memory.size).toBe(1);
    expect(lines).toHaveLength(1);

    const entries = await composed.list();
    expect(entries).toHaveLength(1);
  });

  it("returns empty list when no log has entries", async () => {
    const log = composeAuditLogs(new InMemoryAuditLog(), new InMemoryAuditLog());
    expect(await log.list()).toEqual([]);
  });
});

describe("freezeReceipt", () => {
  it("returns a deeply frozen copy that does not mutate the input", () => {
    const original = createReceipt();
    const frozen = freezeReceipt(original);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.attempts)).toBe(true);
    expect(() => {
      (frozen as TransferReceipt).bytesTransferred = 99;
    }).toThrow(TypeError);
    expect(original.bytesTransferred).toBe(10);
  });
});

describe("summarizeError", () => {
  it("captures message, name, and code from Error instances", () => {
    class TaggedError extends Error {
      constructor(public override readonly name = "TaggedError") {
        super("something failed");
      }
      readonly code = "E_TAG";
    }
    const summary = summarizeError(new TaggedError());

    expect(summary).toEqual({ code: "E_TAG", message: "something failed", name: "TaggedError" });
  });

  it("falls back to string conversion for non-Error values", () => {
    expect(summarizeError("oops")).toEqual({ message: "oops" });
    expect(summarizeError(42)).toEqual({ message: "42" });
  });
});
