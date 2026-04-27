import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  createMemoryProviderFactory,
  createTransferClient,
  type MemoryProviderEntry,
} from "../../src/index";
import { describeProviderContract } from "./providerContract";

const reportModifiedAt = new Date("2026-04-27T12:00:00.000Z");

const fixtureEntries = [
  {
    path: "/incoming",
    type: "directory",
    modifiedAt: new Date("2026-04-27T11:00:00.000Z"),
    uniqueId: "dir:incoming",
  },
  {
    path: "/incoming/report.csv",
    type: "file",
    size: 24,
    modifiedAt: reportModifiedAt,
    createdAt: new Date("2026-04-27T10:00:00.000Z"),
    accessedAt: new Date("2026-04-27T12:30:00.000Z"),
    permissions: { group: "r", other: "", raw: "rw-r-----", user: "rw" },
    owner: "tester",
    group: "qa",
    uniqueId: "file:report",
    raw: { fixture: true },
  },
  {
    path: "/incoming/report-link.csv",
    type: "symlink",
    symlinkTarget: "/incoming/report.csv",
    uniqueId: "link:report",
  },
  {
    path: "relative-note.txt",
    type: "file",
    size: 4,
  },
] satisfies MemoryProviderEntry[];

describeProviderContract("memory", {
  createProviderFactory: () => createMemoryProviderFactory({ entries: fixtureEntries }),
  expectedListPaths: ["/incoming/report-link.csv", "/incoming/report.csv"],
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile: { host: "memory.local", provider: "memory" },
  statPath: "/incoming/report.csv",
});

describe("createMemoryProviderFactory", () => {
  it("connects through an explicitly registered memory provider", async () => {
    const provider = createMemoryProviderFactory({ entries: fixtureEntries });
    const client = createTransferClient({ providers: [provider] });

    expect(client.hasProvider("memory")).toBe(true);
    expect(client.getCapabilities("memory")).toEqual(provider.capabilities);

    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      expect(session.capabilities).toMatchObject({
        authentication: ["anonymous"],
        list: true,
        provider: "memory",
        stat: true,
      });
      await expect(session.fs.list("/")).resolves.toEqual([
        expect.objectContaining({ path: "/incoming", type: "directory" }),
        expect.objectContaining({ path: "/relative-note.txt", type: "file" }),
      ]);
    } finally {
      await session.disconnect();
    }
  });

  it("normalizes fixture paths and returns cloned metadata", async () => {
    const client = createTransferClient({
      providers: [createMemoryProviderFactory({ entries: fixtureEntries })],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      const stat = await session.fs.stat("incoming/report.csv");

      expect(stat).toMatchObject({
        exists: true,
        group: "qa",
        owner: "tester",
        path: "/incoming/report.csv",
        permissions: { raw: "rw-r-----" },
        size: 24,
        type: "file",
        uniqueId: "file:report",
      });
      expect(stat.modifiedAt).toEqual(reportModifiedAt);
      expect(stat.modifiedAt).not.toBe(reportModifiedAt);

      stat.modifiedAt?.setUTCFullYear(2000);
      stat.permissions = { raw: "mutated" };

      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        modifiedAt: reportModifiedAt,
        permissions: { raw: "rw-r-----" },
      });
      await expect(session.fs.stat("relative-note.txt")).resolves.toMatchObject({
        path: "/relative-note.txt",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed errors for missing paths and non-directory lists", async () => {
    const client = createTransferClient({
      providers: [createMemoryProviderFactory({ entries: fixtureEntries })],
    });
    const session = await client.connect({ host: "memory.local", provider: "memory" });

    try {
      await expect(session.fs.stat("/missing.txt")).rejects.toBeInstanceOf(PathNotFoundError);
      await expect(session.fs.list("/incoming/report.csv")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
    } finally {
      await session.disconnect();
    }
  });

  it("rejects invalid fixture trees with typed configuration errors", () => {
    expect(() => createMemoryProviderFactory({ entries: [{ path: "/", type: "file" }] })).toThrow(
      ConfigurationError,
    );
    expect(() =>
      createMemoryProviderFactory({
        entries: [
          { path: "/blocked", type: "file" },
          { path: "/blocked/child.txt", type: "file" },
        ],
      }),
    ).toThrow(ConfigurationError);
  });
});
