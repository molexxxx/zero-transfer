import { describe, expect, it } from "vitest";
import { ConfigurationError, evaluateRetention, type RemoteEntry } from "../../../src/index";

function file(name: string, modifiedAt: Date | undefined): RemoteEntry {
  const entry: RemoteEntry = { name, path: `/dir/${name}`, type: "file" };
  if (modifiedAt !== undefined) entry.modifiedAt = modifiedAt;
  return entry;
}

describe("evaluateRetention", () => {
  it("evicts files older than maxAgeMs and passes through directories", () => {
    const now = new Date("2026-04-28T00:00:00.000Z");
    const entries: RemoteEntry[] = [
      file("fresh.txt", new Date("2026-04-27T23:00:00.000Z")),
      file("old.txt", new Date("2026-04-20T00:00:00.000Z")),
      { name: "subdir", path: "/dir/subdir", type: "directory" },
      file("undated.txt", undefined),
    ];

    const result = evaluateRetention({
      entries,
      now,
      policy: { kind: "age", maxAgeMs: 24 * 60 * 60 * 1000 },
    });

    expect(result.evict.map((entry) => entry.name)).toEqual(["old.txt"]);
    expect(result.keep.map((entry) => entry.name).sort()).toEqual(
      ["fresh.txt", "subdir", "undated.txt"].sort(),
    );
  });

  it("retains the newest maxCount files by modifiedAt", () => {
    const entries: RemoteEntry[] = [
      file("a", new Date("2026-04-20T00:00:00.000Z")),
      file("b", new Date("2026-04-22T00:00:00.000Z")),
      file("c", new Date("2026-04-25T00:00:00.000Z")),
      file("d", new Date("2026-04-27T00:00:00.000Z")),
    ];

    const result = evaluateRetention({ entries, policy: { kind: "count", maxCount: 2 } });

    expect(result.keep.map((entry) => entry.name)).toEqual(["d", "c"]);
    expect(result.evict.map((entry) => entry.name)).toEqual(["b", "a"]);
  });

  it("supports name-based count retention", () => {
    const entries: RemoteEntry[] = [
      file("alpha", undefined),
      file("bravo", undefined),
      file("charlie", undefined),
    ];

    const result = evaluateRetention({
      entries,
      policy: { kind: "count", maxCount: 1, sortBy: "name" },
    });

    expect(result.keep.map((entry) => entry.name)).toEqual(["charlie"]);
    expect(result.evict.map((entry) => entry.name)).toEqual(["bravo", "alpha"]);
  });

  it("returns everything when count threshold is not exceeded", () => {
    const entries: RemoteEntry[] = [file("a", new Date("2026-04-27T00:00:00.000Z"))];
    const result = evaluateRetention({ entries, policy: { kind: "count", maxCount: 5 } });

    expect(result.keep).toHaveLength(1);
    expect(result.evict).toHaveLength(0);
  });

  it("rejects malformed policies", () => {
    expect(() => evaluateRetention({ entries: [], policy: { kind: "age", maxAgeMs: -1 } })).toThrow(
      ConfigurationError,
    );
    expect(() =>
      evaluateRetention({ entries: [], policy: { kind: "count", maxCount: 1.5 } }),
    ).toThrow(ConfigurationError);
  });
});
