import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  REMOTE_MANIFEST_FORMAT_VERSION,
  compareRemoteManifests,
  createMemoryProviderFactory,
  createRemoteManifest,
  parseRemoteManifest,
  serializeRemoteManifest,
  type RemoteEntry,
  type RemoteFileSystem,
  type RemoteManifest,
} from "../../../src/index";

describe("manifest", () => {
  describe("createRemoteManifest", () => {
    it("captures a deterministic snapshot of a remote subtree", async () => {
      const fs = await createSession([
        { path: "/site", type: "directory" },
        {
          path: "/site/index.html",
          type: "file",
          content: "<h1>",
          modifiedAt: new Date("2030-01-01T00:00:00Z"),
        },
        { path: "/site/assets", type: "directory" },
        {
          path: "/site/assets/app.js",
          type: "file",
          content: "x",
          modifiedAt: new Date("2030-01-02T00:00:00Z"),
        },
      ]);

      const manifest = await createRemoteManifest(fs, "/site", {
        now: () => new Date("2030-06-01T12:00:00Z"),
        provider: "memory",
      });

      expect(manifest.formatVersion).toBe(REMOTE_MANIFEST_FORMAT_VERSION);
      expect(manifest.generatedAt).toBe("2030-06-01T12:00:00.000Z");
      expect(manifest.root).toBe("/site");
      expect(manifest.provider).toBe("memory");
      expect(manifest.entries.map((entry) => entry.path)).toEqual([
        "/assets",
        "/assets/app.js",
        "/index.html",
      ]);
      const file = manifest.entries.find((entry) => entry.path === "/index.html");
      expect(file).toMatchObject({
        modifiedAt: "2030-01-01T00:00:00.000Z",
        type: "file",
      });
      expect(file?.size).toBeGreaterThan(0);
    });

    it("forwards walk filters to skip undesired entries", async () => {
      const fs = await createSession([
        { path: "/site", type: "directory" },
        { path: "/site/keep.txt", type: "file", content: "k" },
        { path: "/site/skip.tmp", type: "file", content: "s" },
      ]);

      const manifest = await createRemoteManifest(fs, "/site", {
        filter: (entry) => !entry.path.endsWith(".tmp"),
      });

      const paths = manifest.entries.map((entry) => entry.path);
      expect(paths).toContain("/keep.txt");
      expect(paths).not.toContain("/skip.tmp");
    });
  });

  describe("serializeRemoteManifest / parseRemoteManifest", () => {
    it("round-trips a manifest through JSON", async () => {
      const fs = await createSession([
        { path: "/site", type: "directory" },
        {
          path: "/site/index.html",
          type: "file",
          content: "x",
          modifiedAt: new Date("2030-01-01T00:00:00Z"),
        },
      ]);
      const original = await createRemoteManifest(fs, "/site", { provider: "memory" });

      const json = serializeRemoteManifest(original);
      const restored = parseRemoteManifest(json);

      expect(restored).toEqual(original);
    });

    it("rejects payloads with an unsupported format version", () => {
      const payload = JSON.stringify({
        entries: [],
        formatVersion: 999,
        generatedAt: "2030-01-01T00:00:00.000Z",
        root: "/",
      });
      expect(() => parseRemoteManifest(payload)).toThrow(ConfigurationError);
    });

    it("rejects malformed JSON payloads", () => {
      expect(() => parseRemoteManifest("not-json")).toThrow(ConfigurationError);
    });

    it("rejects entries without a path or with an invalid type", () => {
      const missingPath = JSON.stringify({
        entries: [{ type: "file" }],
        formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
        generatedAt: "2030-01-01T00:00:00.000Z",
        root: "/",
      });
      expect(() => parseRemoteManifest(missingPath)).toThrow(ConfigurationError);

      const badType = JSON.stringify({
        entries: [{ path: "/x", type: "weird" }],
        formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
        generatedAt: "2030-01-01T00:00:00.000Z",
        root: "/",
      });
      expect(() => parseRemoteManifest(badType)).toThrow(ConfigurationError);
    });
  });

  describe("compareRemoteManifests", () => {
    it("flags added, removed, and modified entries between manifests", () => {
      const source = manifestFromEntries("/site", [
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/keep.txt", size: 4, type: "file" },
        { modifiedAt: "2030-01-02T00:00:00.000Z", path: "/changed.txt", size: 7, type: "file" },
        { path: "/added.txt", size: 1, type: "file" },
      ]);
      const destination = manifestFromEntries("/var/www/site", [
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/keep.txt", size: 4, type: "file" },
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/changed.txt", size: 5, type: "file" },
        { path: "/removed.txt", size: 2, type: "file" },
      ]);

      const diff = compareRemoteManifests(source, destination);

      const byPath = Object.fromEntries(diff.entries.map((entry) => [entry.path, entry]));
      expect(diff.summary).toMatchObject({ added: 1, modified: 1, removed: 1 });
      expect(byPath["/added.txt"]?.status).toBe("added");
      expect(byPath["/removed.txt"]?.status).toBe("removed");
      expect(byPath["/changed.txt"]?.status).toBe("modified");
      expect(byPath["/changed.txt"]?.reasons).toEqual(
        expect.arrayContaining(["size", "modifiedAt"]),
      );
      expect(byPath["/keep.txt"]).toBeUndefined();

      // Reconstructed entries should have absolute paths under each manifest's root.
      expect(byPath["/added.txt"]?.source?.path).toBe("/site/added.txt");
      expect(byPath["/removed.txt"]?.destination?.path).toBe("/var/www/site/removed.txt");
    });

    it("includes unchanged entries when requested and applies modifiedAt tolerance", () => {
      const source = manifestFromEntries("/", [
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/file.txt", size: 4, type: "file" },
      ]);
      const destination = manifestFromEntries("/", [
        { modifiedAt: "2030-01-01T00:00:00.500Z", path: "/file.txt", size: 4, type: "file" },
      ]);

      const diff = compareRemoteManifests(source, destination, {
        includeUnchanged: true,
        modifiedAtToleranceMs: 1000,
      });
      expect(diff.entries[0]?.status).toBe("unchanged");
      expect(diff.entries[0]?.reasons).toEqual([]);
    });

    it("compares uniqueId checksums when enabled", () => {
      const source = manifestFromEntries("/", [
        { path: "/file.txt", size: 4, type: "file", uniqueId: "abc" },
      ]);
      const destination = manifestFromEntries("/", [
        { path: "/file.txt", size: 4, type: "file", uniqueId: "xyz" },
      ]);

      const diff = compareRemoteManifests(source, destination, { compareUniqueId: true });
      expect(diff.entries[0]?.status).toBe("modified");
      expect(diff.entries[0]?.reasons).toContain("checksum");
    });

    it("rejects non-object payloads, missing root, missing generatedAt, missing entries", () => {
      expect(() => parseRemoteManifest("null")).toThrow(ConfigurationError);
      expect(() => parseRemoteManifest("true")).toThrow(ConfigurationError);
      expect(() =>
        parseRemoteManifest(
          JSON.stringify({ entries: [], formatVersion: REMOTE_MANIFEST_FORMAT_VERSION }),
        ),
      ).toThrow(ConfigurationError);
      expect(() =>
        parseRemoteManifest(
          JSON.stringify({
            entries: [],
            formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
            root: "/",
          }),
        ),
      ).toThrow(ConfigurationError);
      expect(() =>
        parseRemoteManifest(
          JSON.stringify({
            entries: "not-array",
            formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
            generatedAt: "2030-01-01T00:00:00.000Z",
            root: "/",
          }),
        ),
      ).toThrow(ConfigurationError);
      // entry that is not an object
      expect(() =>
        parseRemoteManifest(
          JSON.stringify({
            entries: [null],
            formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
            generatedAt: "2030-01-01T00:00:00.000Z",
            root: "/",
          }),
        ),
      ).toThrow(ConfigurationError);
    });

    it("preserves provider, size, modifiedAt, uniqueId, and symlinkTarget on round-trip", () => {
      const payload = JSON.stringify({
        entries: [
          {
            modifiedAt: "2030-01-01T00:00:00.000Z",
            path: "/file.txt",
            size: 4,
            symlinkTarget: "/target",
            type: "file",
            uniqueId: "u1",
          },
        ],
        formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
        generatedAt: "2030-01-01T00:00:00.000Z",
        provider: "memory",
        root: "/site",
      });
      const parsed = parseRemoteManifest(payload);
      expect(parsed.provider).toBe("memory");
      expect(parsed.entries[0]).toMatchObject({
        modifiedAt: "2030-01-01T00:00:00.000Z",
        size: 4,
        symlinkTarget: "/target",
        uniqueId: "u1",
      });
    });

    it("flags type changes, treats invalid modifiedAt as unchanged, and detects modifications outside tolerance", () => {
      const source = manifestFromEntries("/", [
        { modifiedAt: "not-a-date", path: "/a.txt", size: 1, type: "file" },
        { path: "/b", type: "directory" },
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/c.txt", size: 1, type: "file" },
      ]);
      const destination = manifestFromEntries("/x", [
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/a.txt", size: 1, type: "file" },
        { path: "/b", type: "file" },
        { modifiedAt: "2030-01-01T00:00:10.000Z", path: "/c.txt", size: 1, type: "file" },
      ]);
      const diff = compareRemoteManifests(source, destination, {
        modifiedAtToleranceMs: 100,
      });
      const byPath = Object.fromEntries(diff.entries.map((entry) => [entry.path, entry]));
      expect(byPath["/b"]?.reasons).toContain("type");
      expect(byPath["/c.txt"]?.reasons).toContain("modifiedAt");
    });

    it("disables size and modifiedAt comparisons when configured", () => {
      const source = manifestFromEntries("/", [
        { modifiedAt: "2030-01-01T00:00:00.000Z", path: "/a.txt", size: 1, type: "file" },
      ]);
      const destination = manifestFromEntries("/", [
        { modifiedAt: "2030-02-01T00:00:00.000Z", path: "/a.txt", size: 99, type: "file" },
      ]);
      const diff = compareRemoteManifests(source, destination, {
        compareModifiedAt: false,
        compareSize: false,
      });
      expect(diff.entries.length).toBe(0);
    });
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

function manifestFromEntries(root: string, entries: RemoteManifest["entries"]): RemoteManifest {
  return {
    entries: [...entries].sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    ),
    formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
    generatedAt: "2030-01-01T00:00:00.000Z",
    provider: "memory",
    root,
  };
}
