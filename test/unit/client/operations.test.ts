import { Buffer } from "node:buffer";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  copyBetween,
  createLocalProviderFactory,
  createMemoryProviderFactory,
  createTransferClient,
  downloadFile,
  uploadFile,
  type TransferSession,
} from "../../../src/index";

let rootPath: string;

beforeEach(async () => {
  rootPath = await mkdtemp(path.join(os.tmpdir(), "zero-transfer-friendly-"));
  await writeFile(path.join(rootPath, "report.csv"), "id,name\n1,Ada\n", "utf8");
});

afterEach(async () => {
  await rm(rootPath, { force: true, recursive: true });
});

function makeClient() {
  return createTransferClient({
    providers: [createLocalProviderFactory({ rootPath }), createMemoryProviderFactory()],
  });
}

async function readMemorySession(client: ReturnType<typeof makeClient>) {
  return client.connect({ host: "memory.local", provider: "memory" });
}

describe("uploadFile", () => {
  it("uploads a single file from a local path to a remote endpoint", async () => {
    const client = makeClient();
    const receipt = await uploadFile({
      client,
      destination: {
        path: "/uploads/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
      localPath: path.join(rootPath, "report.csv"),
    });
    expect(receipt.bytesTransferred).toBeGreaterThan(0);
    expect(receipt.jobId).toMatch(/^route:upload:/);

    let session: TransferSession | undefined;
    try {
      session = await readMemorySession(client);
      const stat = await session.fs.stat("/uploads/report.csv");
      expect(stat.size).toBe(14);
    } finally {
      await session?.disconnect();
    }
  });
});

describe("downloadFile", () => {
  it("downloads a remote file to a local path", async () => {
    const client = makeClient();
    await uploadFile({
      client,
      destination: {
        path: "/transit/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
      localPath: path.join(rootPath, "report.csv"),
    });
    const downloadTarget = path.join(rootPath, "downloaded.csv");
    const receipt = await downloadFile({
      client,
      localPath: downloadTarget,
      source: {
        path: "/transit/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
    });
    expect(receipt.jobId).toMatch(/^route:download:/);
    const contents = await readFile(downloadTarget, "utf8");
    expect(contents).toBe("id,name\n1,Ada\n");
  });
});

describe("copyBetween", () => {
  it("copies between two remote endpoints in a single call", async () => {
    const client = makeClient();
    await uploadFile({
      client,
      destination: {
        path: "/source/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
      localPath: path.join(rootPath, "report.csv"),
    });
    const receipt = await copyBetween({
      client,
      destination: {
        path: "/destination/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
      routeName: "promote-report",
      source: {
        path: "/source/report.csv",
        profile: { host: "memory.local", provider: "memory" },
      },
    });
    expect(receipt.jobId).toMatch(/^route:copy:/);
    const session = await readMemorySession(client);
    try {
      const stat = await session.fs.stat("/destination/report.csv");
      expect(stat.size).toBe(14);
      void Buffer; // ensure import not pruned
    } finally {
      await session.disconnect();
    }
  });
});
