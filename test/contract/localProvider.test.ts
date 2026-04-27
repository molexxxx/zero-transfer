import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  createLocalProviderFactory,
  createTransferClient,
} from "../../src/index";
import { describeProviderContract } from "./providerContract";

let rootPath: string;

beforeEach(async () => {
  rootPath = await mkdtemp(path.join(os.tmpdir(), "zero-transfer-local-provider-"));
  await mkdir(path.join(rootPath, "incoming"));
  await writeFile(path.join(rootPath, "incoming", "report.csv"), "id,name\n1,Ada\n", "utf8");
  await writeFile(path.join(rootPath, "root-note.txt"), "note", "utf8");
});

afterEach(async () => {
  await rm(rootPath, { force: true, recursive: true });
});

describeProviderContract("local", {
  createProviderFactory: () => createLocalProviderFactory({ rootPath }),
  expectedCapabilities: {
    authentication: ["anonymous"],
    list: true,
    provider: "local",
    stat: true,
  },
  expectedListPaths: ["/incoming/report.csv"],
  expectedStat: {
    name: "report.csv",
    path: "/incoming/report.csv",
    size: 14,
    type: "file",
  },
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile: { host: "local", provider: "local" },
  statPath: "/incoming/report.csv",
});

describe("createLocalProviderFactory", () => {
  it("can use profile.host as the local root path", async () => {
    const client = createTransferClient({ providers: [createLocalProviderFactory()] });
    const session = await client.connect({ host: rootPath, provider: "local" });

    try {
      await expect(session.fs.list("/")).resolves.toEqual([
        expect.objectContaining({ path: "/incoming", type: "directory" }),
        expect.objectContaining({ path: "/root-note.txt", type: "file" }),
      ]);
      const stat = await session.fs.stat("incoming/report.csv");

      expect(stat.exists).toBe(true);
      expect(typeof stat.permissions?.raw).toBe("string");
      expect(typeof stat.uniqueId).toBe("string");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed errors for missing paths and root escapes", async () => {
    const client = createTransferClient({
      providers: [createLocalProviderFactory({ rootPath })],
    });
    const session = await client.connect({ host: "local", provider: "local" });

    try {
      await expect(session.fs.stat("/missing.txt")).rejects.toBeInstanceOf(PathNotFoundError);
      await expect(session.fs.list("/incoming/report.csv")).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(session.fs.stat("../outside.txt")).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });
});
