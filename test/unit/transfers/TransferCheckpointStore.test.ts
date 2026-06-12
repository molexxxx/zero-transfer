import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_CHECKPOINT_TTL_MS,
  createFileSystemTransferCheckpointStore,
  createMemoryTransferCheckpointStore,
  fingerprintsMatch,
  ConfigurationError,
  type TransferCheckpointKey,
  type TransferCheckpointRecord,
} from "../../../src/index";

const key: TransferCheckpointKey = {
  destination: { path: "/remote/big.bin", provider: "sftp" },
  source: { path: "/local/big.bin", provider: "local" },
};

function createRecord(overrides: Partial<TransferCheckpointRecord> = {}): TransferCheckpointRecord {
  // Fresh timestamps: stores apply the 7-day TTL against the real clock.
  return {
    createdAtMs: Date.now(),
    fingerprint: { modifiedAtMs: 500, sizeBytes: 4096 },
    pid: process.pid,
    state: { committedBytes: 2048, kind: "byte-offset" },
    updatedAtMs: Date.now(),
    version: 1,
    ...overrides,
  };
}

describe("fingerprintsMatch", () => {
  it("matches when every comparable field is equal", () => {
    expect(
      fingerprintsMatch(
        { etag: "abc", modifiedAtMs: 10, sizeBytes: 1 },
        { etag: "abc", modifiedAtMs: 10, sizeBytes: 1 },
      ),
    ).toBe(true);
  });

  it("rejects any comparable mismatch", () => {
    expect(fingerprintsMatch({ sizeBytes: 1 }, { sizeBytes: 2 })).toBe(false);
    expect(fingerprintsMatch({ modifiedAtMs: 1 }, { modifiedAtMs: 2 })).toBe(false);
    expect(fingerprintsMatch({ etag: "a" }, { etag: "b" })).toBe(false);
    expect(
      fingerprintsMatch({ modifiedAtMs: 9, sizeBytes: 1 }, { modifiedAtMs: 10, sizeBytes: 1 }),
    ).toBe(false);
  });

  it("requires at least one comparable field", () => {
    expect(fingerprintsMatch({}, {})).toBe(false);
    expect(fingerprintsMatch({ sizeBytes: 1 }, { modifiedAtMs: 10 })).toBe(false);
  });

  it("ignores fields absent on either side when another field matches", () => {
    expect(fingerprintsMatch({ etag: "abc", sizeBytes: 1 }, { sizeBytes: 1 })).toBe(true);
  });
});

describe("createMemoryTransferCheckpointStore", () => {
  it("round-trips records by source+destination identity", async () => {
    const store = createMemoryTransferCheckpointStore();
    const record = createRecord();

    await store.save(key, record);
    expect(await store.load(key)).toEqual(record);

    // A different destination is a different transfer.
    expect(
      await store.load({ ...key, destination: { path: "/remote/other.bin", provider: "sftp" } }),
    ).toBeUndefined();

    await store.clear(key);
    expect(await store.load(key)).toBeUndefined();
  });

  it("distinguishes scoped keys", async () => {
    const store = createMemoryTransferCheckpointStore();
    await store.save({ ...key, scope: "host-a" }, createRecord());

    expect(await store.load({ ...key, scope: "host-b" })).toBeUndefined();
    expect(await store.load({ ...key, scope: "host-a" })).toBeDefined();
  });

  it("expires records past the ttl", async () => {
    let nowMs = 10_000;
    const store = createMemoryTransferCheckpointStore({ now: () => nowMs, ttlMs: 1_000 });
    await store.save(key, createRecord({ updatedAtMs: 10_000 }));

    nowMs = 10_999;
    expect(await store.load(key)).toBeDefined();
    nowMs = 11_001;
    expect(await store.load(key)).toBeUndefined();
  });
});

describe("createFileSystemTransferCheckpointStore", () => {
  let directory: string | undefined;

  afterEach(async () => {
    if (directory !== undefined) {
      await rm(directory, { force: true, recursive: true });
      directory = undefined;
    }
  });

  async function createTempDirectory(): Promise<string> {
    directory = await mkdtemp(join(tmpdir(), "zt-checkpoints-"));
    return directory;
  }

  it("requires a directory", () => {
    expect(() => createFileSystemTransferCheckpointStore({ directory: "" })).toThrow(
      ConfigurationError,
    );
  });

  it("persists records as hashed JSON files and round-trips them", async () => {
    const dir = await createTempDirectory();
    const store = createFileSystemTransferCheckpointStore({ directory: dir });
    const record = createRecord({
      state: {
        committedBytes: 16,
        kind: "parts",
        parts: [{ byteEnd: 16, partNumber: 1, token: '"etag-1"' }],
        partSizeBytes: 16,
        uploadToken: "upload-1",
      },
    });

    await store.save(key, record);
    const files = await readdir(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^[0-9a-f]{64}\.json$/);
    // No leftover tmp files from the atomic write.
    expect(files.some((file) => file.endsWith(".tmp"))).toBe(false);

    expect(await store.load(key)).toEqual(record);

    await store.clear(key);
    expect(await store.load(key)).toBeUndefined();
    // Clearing a missing record is a no-op.
    await store.clear(key);
  });

  it("treats corrupt or malformed files as absent and deletes them", async () => {
    const dir = await createTempDirectory();
    const store = createFileSystemTransferCheckpointStore({ directory: dir });
    await store.save(key, createRecord());
    const files = await readdir(dir);
    const file = join(dir, files[0] ?? "");

    await writeFile(file, "{ not json", "utf8");
    expect(await store.load(key)).toBeUndefined();
    expect(await readdir(dir)).toHaveLength(0);

    await store.save(key, createRecord());
    const valid = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
    await writeFile(file, JSON.stringify({ ...valid, state: { kind: "unknown" } }), "utf8");
    expect(await store.load(key)).toBeUndefined();
  });

  it("expires records past the ttl and deletes the file", async () => {
    const dir = await createTempDirectory();
    let nowMs = 50_000;
    const store = createFileSystemTransferCheckpointStore({
      directory: dir,
      now: () => nowMs,
      ttlMs: 1_000,
    });

    await store.save(key, createRecord({ updatedAtMs: 50_000 }));
    nowMs = 51_001;
    expect(await store.load(key)).toBeUndefined();
    expect(await readdir(dir)).toHaveLength(0);
  });

  it("defaults the ttl to 7 days", () => {
    expect(DEFAULT_CHECKPOINT_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
