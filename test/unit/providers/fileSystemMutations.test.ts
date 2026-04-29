import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PathNotFoundError,
  createLocalProviderFactory,
  createMemoryProviderFactory,
  createTransferClient,
} from "../../../src/index";

describe("memory provider file-system mutations", () => {
  function connectMemory() {
    const client = createTransferClient({
      providers: [
        createMemoryProviderFactory({
          entries: [
            { path: "/data", type: "directory" },
            { path: "/data/a.txt", type: "file", content: "alpha" },
            { path: "/data/b.txt", type: "file", content: "bravo" },
            { path: "/data/sub", type: "directory" },
            { path: "/data/sub/c.txt", type: "file", content: "charlie" },
          ],
        }),
      ],
    });
    return client.connect({ host: "memory.local", provider: "memory" });
  }

  it("removes a file with remove()", async () => {
    const session = await connectMemory();
    try {
      await session.fs.remove?.("/data/a.txt");
      await expect(session.fs.stat("/data/a.txt")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("ignores missing on remove when ignoreMissing is set", async () => {
    const session = await connectMemory();
    try {
      await expect(
        session.fs.remove?.("/data/missing.txt", { ignoreMissing: true }),
      ).resolves.toBeUndefined();
      await expect(session.fs.remove?.("/data/missing.txt")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
    } finally {
      await session.disconnect();
    }
  });

  it("renames a file", async () => {
    const session = await connectMemory();
    try {
      await session.fs.rename?.("/data/a.txt", "/data/renamed.txt");
      const stat = await session.fs.stat("/data/renamed.txt");
      expect(stat.name).toBe("renamed.txt");
      await expect(session.fs.stat("/data/a.txt")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("creates and removes directories", async () => {
    const session = await connectMemory();
    try {
      await session.fs.mkdir?.("/fresh");
      const stat = await session.fs.stat("/fresh");
      expect(stat.type).toBe("directory");
      await session.fs.rmdir?.("/fresh");
      await expect(session.fs.stat("/fresh")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("mkdir recursive creates intermediate directories", async () => {
    const session = await connectMemory();
    try {
      await session.fs.mkdir?.("/a/b/c", { recursive: true });
      expect((await session.fs.stat("/a")).type).toBe("directory");
      expect((await session.fs.stat("/a/b")).type).toBe("directory");
      expect((await session.fs.stat("/a/b/c")).type).toBe("directory");
    } finally {
      await session.disconnect();
    }
  });

  it("rmdir refuses non-empty directory without recursive", async () => {
    const session = await connectMemory();
    try {
      await expect(session.fs.rmdir?.("/data")).rejects.toBeTruthy();
      await session.fs.rmdir?.("/data", { recursive: true });
      await expect(session.fs.stat("/data")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });
});

describe("local provider file-system mutations", () => {
  let rootPath: string;

  beforeEach(async () => {
    rootPath = await mkdtemp(path.join(os.tmpdir(), "zt-fs-mut-"));
    await writeFile(path.join(rootPath, "a.txt"), "alpha", "utf8");
    await mkdir(path.join(rootPath, "nested"));
    await writeFile(path.join(rootPath, "nested", "b.txt"), "bravo", "utf8");
  });

  afterEach(async () => {
    await rm(rootPath, { force: true, recursive: true });
  });

  function connectLocal() {
    const client = createTransferClient({
      providers: [createLocalProviderFactory({ rootPath })],
    });
    return client.connect({ host: "local", provider: "local" });
  }

  it("removes a file", async () => {
    const session = await connectLocal();
    try {
      await session.fs.remove?.("/a.txt");
      await expect(session.fs.stat("/a.txt")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("renames a file", async () => {
    const session = await connectLocal();
    try {
      await session.fs.rename?.("/a.txt", "/renamed.txt");
      const contents = await readFile(path.join(rootPath, "renamed.txt"), "utf8");
      expect(contents).toBe("alpha");
    } finally {
      await session.disconnect();
    }
  });

  it("mkdir recursive and rmdir recursive", async () => {
    const session = await connectLocal();
    try {
      await session.fs.mkdir?.("/x/y/z", { recursive: true });
      const stat = await session.fs.stat("/x/y/z");
      expect(stat.type).toBe("directory");

      await session.fs.rmdir?.("/nested", { recursive: true });
      await expect(session.fs.stat("/nested")).rejects.toBeInstanceOf(PathNotFoundError);
    } finally {
      await session.disconnect();
    }
  });

  it("rmdir ignoreMissing returns silently", async () => {
    const session = await connectLocal();
    try {
      await expect(
        session.fs.rmdir?.("/missing", { ignoreMissing: true }),
      ).resolves.toBeUndefined();
    } finally {
      await session.disconnect();
    }
  });
});
