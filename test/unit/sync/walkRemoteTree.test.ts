import { describe, expect, it } from "vitest";
import {
  AbortError,
  createMemoryProviderFactory,
  walkRemoteTree,
  type RemoteEntry,
  type RemoteFileSystem,
} from "../../../src/index";

describe("walkRemoteTree", () => {
  it("walks the full tree depth-first with deterministic ordering", async () => {
    const fs = await createMemorySession([
      { path: "/a", type: "directory" },
      { path: "/a/b.txt", type: "file", content: "b" },
      { path: "/a/c", type: "directory" },
      { path: "/a/c/d.txt", type: "file", content: "d" },
      { path: "/e.txt", type: "file", content: "e" },
    ]);
    const paths: string[] = [];

    for await (const record of walkRemoteTree(fs, "/")) {
      paths.push(`${record.depth}:${record.entry.path}`);
    }

    expect(paths).toEqual([
      "0:/a",
      "1:/a/b.txt",
      "1:/a/c",
      "2:/a/c/d.txt",
      "0:/e.txt",
    ]);
  });

  it("respects maxDepth and recursive=false", async () => {
    const fs = await createMemorySession([
      { path: "/a", type: "directory" },
      { path: "/a/b", type: "directory" },
      { path: "/a/b/c.txt", type: "file" },
    ]);

    const flat: string[] = [];
    for await (const record of walkRemoteTree(fs, "/", { recursive: false })) {
      flat.push(record.entry.path);
    }
    expect(flat).toEqual(["/a"]);

    const limited: string[] = [];
    for await (const record of walkRemoteTree(fs, "/", { maxDepth: 1 })) {
      limited.push(record.entry.path);
    }
    expect(limited).toEqual(["/a", "/a/b"]);
  });

  it("filters entries and skips descent into filtered directories", async () => {
    const fs = await createMemorySession([
      { path: "/keep", type: "directory" },
      { path: "/keep/file.txt", type: "file", content: "x" },
      { path: "/skip", type: "directory" },
      { path: "/skip/secret.txt", type: "file", content: "x" },
    ]);
    const paths: string[] = [];

    for await (const record of walkRemoteTree(fs, "/", {
      filter: (entry) => entry.path !== "/skip",
    })) {
      paths.push(record.entry.path);
    }

    expect(paths).toEqual(["/keep", "/keep/file.txt"]);
  });

  it("excludes directory or file entries based on options", async () => {
    const fs = await createMemorySession([
      { path: "/a", type: "directory" },
      { path: "/a/b.txt", type: "file" },
    ]);

    const filesOnly: string[] = [];
    for await (const record of walkRemoteTree(fs, "/", { includeDirectories: false })) {
      filesOnly.push(record.entry.path);
    }
    expect(filesOnly).toEqual(["/a/b.txt"]);

    const dirsOnly: string[] = [];
    for await (const record of walkRemoteTree(fs, "/", { includeFiles: false })) {
      dirsOnly.push(record.entry.path);
    }
    expect(dirsOnly).toEqual(["/a"]);
  });

  it("aborts traversal when the abort signal is cancelled", async () => {
    const fs = await createMemorySession([{ path: "/a", type: "directory" }]);
    const controller = new AbortController();
    controller.abort();

    const iterator = walkRemoteTree(fs, "/", { signal: controller.signal });
    await expect(iterator.next()).rejects.toBeInstanceOf(AbortError);
  });
});

interface FixtureEntry {
  path: string;
  type: RemoteEntry["type"];
  content?: string;
}

async function createMemorySession(entries: FixtureEntry[]): Promise<RemoteFileSystem> {
  const factory = createMemoryProviderFactory({ entries });
  const provider = factory.create();
  const session = await provider.connect({ host: "memory", protocol: "ftp" });
  return session.fs;
}
