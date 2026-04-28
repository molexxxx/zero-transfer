import { describe, expect, it } from "vitest";
import {
  createMemoryProviderFactory,
  diffRemoteTrees,
  type RemoteEntry,
  type RemoteFileSystem,
} from "../../../src/index";

describe("diffRemoteTrees", () => {
  it("identifies added, removed, modified, and unchanged entries", async () => {
    const source = await createSession([
      { path: "/a", type: "directory" },
      { path: "/a/keep.txt", type: "file", content: "same" },
      { path: "/a/changed.txt", type: "file", content: "new", modifiedAt: new Date("2030-01-02T00:00:00Z") },
      { path: "/a/added.txt", type: "file", content: "added" },
    ]);
    const destination = await createSession([
      { path: "/a", type: "directory" },
      { path: "/a/keep.txt", type: "file", content: "same" },
      { path: "/a/changed.txt", type: "file", content: "old-content", modifiedAt: new Date("2030-01-01T00:00:00Z") },
      { path: "/a/removed.txt", type: "file", content: "gone" },
    ]);

    const diff = await diffRemoteTrees(source, "/", destination, "/");

    const byPath = Object.fromEntries(diff.entries.map((entry) => [entry.path, entry]));
    expect(diff.summary).toMatchObject({ added: 1, modified: 1, removed: 1 });
    expect(byPath["/a/added.txt"]?.status).toBe("added");
    expect(byPath["/a/removed.txt"]?.status).toBe("removed");
    expect(byPath["/a/changed.txt"]?.status).toBe("modified");
    expect(byPath["/a/changed.txt"]?.reasons).toEqual(
      expect.arrayContaining(["size", "modifiedAt"]),
    );
    expect(byPath["/a/keep.txt"]).toBeUndefined();
  });

  it("includes unchanged entries when requested", async () => {
    const same: { path: string; type: RemoteEntry["type"]; content: string } = {
      content: "stable",
      path: "/file.txt",
      type: "file",
    };
    const source = await createSession([same]);
    const destination = await createSession([same]);

    const diff = await diffRemoteTrees(source, "/", destination, "/", {
      includeUnchanged: true,
    });

    expect(diff.summary.unchanged).toBe(1);
    expect(diff.entries[0]?.status).toBe("unchanged");
    expect(diff.entries[0]?.reasons).toEqual([]);
  });

  it("compares relative paths under non-root subtrees", async () => {
    const source = await createSession([
      { path: "/src", type: "directory" },
      { path: "/src/file.txt", type: "file", content: "x" },
    ]);
    const destination = await createSession([
      { path: "/dst", type: "directory" },
      { path: "/dst/file.txt", type: "file", content: "x" },
    ]);

    const diff = await diffRemoteTrees(source, "/src", destination, "/dst", {
      includeUnchanged: true,
    });

    expect(diff.entries.map((entry) => entry.path)).toEqual(["/file.txt"]);
    expect(diff.entries[0]?.status).toBe("unchanged");
  });

  it("flags type mismatches as modified", async () => {
    const source = await createSession([
      { path: "/thing", type: "directory" },
    ]);
    const destination = await createSession([
      { path: "/thing", type: "file", content: "data" },
    ]);

    const diff = await diffRemoteTrees(source, "/", destination, "/");

    expect(diff.entries[0]?.status).toBe("modified");
    expect(diff.entries[0]?.reasons).toContain("type");
  });

  it("treats matching uniqueId checksums as equal when requested", async () => {
    const source = await createSession([
      { path: "/a.txt", type: "file", content: "12345", uniqueId: "sha256:same" },
    ]);
    const destination = await createSession([
      { path: "/a.txt", type: "file", content: "abcde", uniqueId: "sha256:same" },
    ]);

    const diff = await diffRemoteTrees(source, "/", destination, "/", {
      compareModifiedAt: false,
      compareSize: false,
      compareUniqueId: true,
      includeUnchanged: true,
    });

    expect(diff.entries[0]?.status).toBe("unchanged");
  });
});

interface FixtureEntry {
  path: string;
  type: RemoteEntry["type"];
  content?: string;
  modifiedAt?: Date;
  uniqueId?: string;
}

async function createSession(entries: FixtureEntry[]): Promise<RemoteFileSystem> {
  const factory = createMemoryProviderFactory({ entries });
  const provider = factory.create();
  const session = await provider.connect({ host: "memory", protocol: "ftp" });
  return session.fs;
}
