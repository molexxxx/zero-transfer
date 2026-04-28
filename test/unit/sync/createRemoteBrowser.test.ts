import { describe, expect, it } from "vitest";
import {
  buildRemoteBreadcrumbs,
  createMemoryProviderFactory,
  createRemoteBrowser,
  filterRemoteEntries,
  parentRemotePath,
  sortRemoteEntries,
  type RemoteEntry,
  type RemoteFileSystem,
} from "../../../src/index";

describe("createRemoteBrowser helpers", () => {
  it("computes parent paths and breadcrumbs", () => {
    expect(parentRemotePath("/")).toBe("/");
    expect(parentRemotePath("/a")).toBe("/");
    expect(parentRemotePath("/a/b")).toBe("/a");
    expect(parentRemotePath("/a/b/c/")).toBe("/a/b");

    expect(buildRemoteBreadcrumbs("/")).toEqual([{ name: "/", path: "/" }]);
    expect(buildRemoteBreadcrumbs("/var/www/site")).toEqual([
      { name: "/", path: "/" },
      { name: "var", path: "/var" },
      { name: "www", path: "/var/www" },
      { name: "site", path: "/var/www/site" },
    ]);
  });

  it("sorts entries with directories first by default", () => {
    const entries = makeEntries([
      { name: "b.txt", type: "file", size: 5 },
      { name: "alpha", type: "directory" },
      { name: "a.txt", type: "file", size: 1 },
      { name: "zeta", type: "directory" },
    ]);
    const sorted = sortRemoteEntries(entries);
    expect(sorted.map((entry) => entry.name)).toEqual(["alpha", "zeta", "a.txt", "b.txt"]);
  });

  it("sorts by size descending while still grouping directories first", () => {
    const entries = makeEntries([
      { name: "small.txt", type: "file", size: 1 },
      { name: "big.txt", type: "file", size: 100 },
      { name: "mid", type: "directory" },
    ]);
    const sorted = sortRemoteEntries(entries, "size", "desc");
    expect(sorted.map((entry) => entry.name)).toEqual(["mid", "big.txt", "small.txt"]);
  });

  it("filters hidden entries when showHidden is false", () => {
    const entries = makeEntries([
      { name: ".hidden", type: "file" },
      { name: "visible.txt", type: "file" },
    ]);
    const filtered = filterRemoteEntries(entries, { showHidden: false });
    expect(filtered.map((entry) => entry.name)).toEqual(["visible.txt"]);
  });
});

describe("createRemoteBrowser navigation", () => {
  it("loads, opens, and pops the current directory", async () => {
    const fs = await createSession([
      { path: "/site", type: "directory" },
      { path: "/site/index.html", type: "file", content: "<h1>" },
      { path: "/site/assets", type: "directory" },
      { path: "/site/assets/app.js", type: "file", content: "x" },
    ]);

    const browser = createRemoteBrowser({ fs, initialPath: "/site" });
    const initial = await browser.refresh();
    expect(initial.path).toBe("/site");
    expect(initial.entries.map((entry) => entry.name)).toEqual(["assets", "index.html"]);
    expect(initial.breadcrumbs).toEqual([
      { name: "/", path: "/" },
      { name: "site", path: "/site" },
    ]);

    const assetsEntry = initial.entries.find((entry) => entry.name === "assets");
    expect(assetsEntry).toBeDefined();
    const opened = await browser.open(assetsEntry as RemoteEntry);
    expect(opened.path).toBe("/site/assets");
    expect(opened.entries.map((entry) => entry.name)).toEqual(["app.js"]);

    const popped = await browser.up();
    expect(popped.path).toBe("/site");

    const root = await browser.up();
    expect(root.path).toBe("/");
  });

  it("supports relative navigation, .. and absolute paths", async () => {
    const fs = await createSession([
      { path: "/a", type: "directory" },
      { path: "/a/b", type: "directory" },
      { path: "/a/b/file.txt", type: "file", content: "x" },
    ]);

    const browser = createRemoteBrowser({ fs, initialPath: "/a" });
    await browser.refresh();
    const inner = await browser.navigate("b");
    expect(inner.path).toBe("/a/b");

    const back = await browser.navigate("..");
    expect(back.path).toBe("/a");

    const absolute = await browser.navigate("/a/b");
    expect(absolute.path).toBe("/a/b");
  });

  it("rejects opening non-directory entries", async () => {
    const fs = await createSession([
      { path: "/file.txt", type: "file", content: "x" },
    ]);

    const browser = createRemoteBrowser({ fs });
    const snapshot = await browser.refresh();
    const file = snapshot.entries[0];
    expect(file).toBeDefined();
    await expect(browser.open(file as RemoteEntry)).rejects.toThrow(TypeError);
  });
});

interface FixtureEntry {
  path: string;
  type: RemoteEntry["type"];
  content?: string;
  modifiedAt?: Date;
}

async function createSession(entries: FixtureEntry[]): Promise<RemoteFileSystem> {
  const factory = createMemoryProviderFactory({ entries });
  const provider = factory.create();
  const session = await provider.connect({ host: "memory", protocol: "ftp" });
  return session.fs;
}

function makeEntries(
  records: Array<{ name: string; type: RemoteEntry["type"]; size?: number }>,
): RemoteEntry[] {
  return records.map((record) => {
    const entry: RemoteEntry = {
      name: record.name,
      path: `/${record.name}`,
      type: record.type,
    };
    if (record.size !== undefined) entry.size = record.size;
    return entry;
  });
}
