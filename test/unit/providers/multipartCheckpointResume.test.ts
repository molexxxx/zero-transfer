import { describe, expect, it } from "vitest";
import {
  createAzureBlobProviderFactory,
  createS3ProviderFactory,
  type HttpFetch,
  type ProviderTransferWriteRequest,
  type TransferCheckpointHandle,
  type TransferCheckpointState,
  type TransferProgressEvent,
} from "../../../src/index";

function makeProgressEvent(
  bytesTransferred: number,
  totalBytes: number | undefined,
): TransferProgressEvent {
  const event: TransferProgressEvent = {
    bytesPerSecond: 0,
    bytesTransferred,
    elapsedMs: 0,
    startedAt: new Date(0),
    transferId: "mp-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function multiChunk(chunks: Uint8Array[]): AsyncIterable<Uint8Array> {
  return {
    [Symbol.asyncIterator]() {
      let index = 0;
      return {
        next: () => {
          if (index >= chunks.length) {
            return Promise.resolve({ done: true as const, value: undefined });
          }
          const value = chunks[index] as Uint8Array;
          index += 1;
          return Promise.resolve({ done: false as const, value });
        },
      };
    },
  };
}

interface FakeCheckpoint {
  handle: TransferCheckpointHandle;
  saves: TransferCheckpointState[];
  cleared: () => boolean;
}

function createFakeCheckpoint(state?: TransferCheckpointState): FakeCheckpoint {
  const saves: TransferCheckpointState[] = [];
  let cleared = false;
  const handle: TransferCheckpointHandle = {
    clear: () => {
      cleared = true;
      return Promise.resolve();
    },
    save: (next) => {
      saves.push(next);
      return Promise.resolve();
    },
    ...(state !== undefined ? { state } : {}),
  };
  return { cleared: () => cleared, handle, saves };
}

function makeWriteRequest(
  path: string,
  chunks: Uint8Array[],
  overrides: Partial<ProviderTransferWriteRequest> = {},
): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: multiChunk(chunks),
    endpoint: { path, provider: "s3" },
    job: { id: "mp-job", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
    ...overrides,
  };
}

describe("S3 parallel multipart with unified checkpoints", () => {
  it("uploads parts in parallel and checkpoints the contiguous prefix through the handle", async () => {
    let inFlightParts = 0;
    let maxInFlightParts = 0;
    let completeBody = "";
    const fetchImpl: HttpFetch = async (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return new Response(
          `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>UP-PAR</UploadId></InitiateMultipartUploadResult>`,
          { status: 200 },
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        const partNumber = new URL(url).searchParams.get("partNumber") ?? "0";
        inFlightParts += 1;
        maxInFlightParts = Math.max(maxInFlightParts, inFlightParts);
        await new Promise((resolve) => setTimeout(resolve, 2));
        inFlightParts -= 1;
        return new Response(null, { headers: { etag: `"p${partNumber}"` }, status: 200 });
      }
      if (init?.method === "POST" && url.includes("uploadId")) {
        completeBody = new TextDecoder().decode(init.body as Uint8Array);
        return new Response(
          `<?xml version="1.0"?><CompleteMultipartUploadResult><ETag>"final"</ETag></CompleteMultipartUploadResult>`,
          { status: 200 },
        );
      }
      return new Response(null, { status: 500 });
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partConcurrency: 3, partSizeBytes: 1024, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const checkpoint = createFakeCheckpoint();
    const progress: number[] = [];
    // 6 KiB payload → 6 parts of 1 KiB.
    const chunks = Array.from({ length: 12 }, (_, index) => new Uint8Array(512).fill(index));
    const result = await transfers.write(
      makeWriteRequest("/par.bin", chunks, {
        checkpoint: checkpoint.handle,
        reportProgress: (bytesTransferred, totalBytes) => {
          progress.push(bytesTransferred);
          return makeProgressEvent(bytesTransferred, totalBytes);
        },
      }),
    );

    expect(maxInFlightParts).toBeGreaterThan(1);
    expect(maxInFlightParts).toBeLessThanOrEqual(3);
    expect(result.bytesTransferred).toBe(12 * 512);
    expect(result.checksum).toBe('"final"');
    // Complete body lists every part in part-number order.
    const orderedParts = [...completeBody.matchAll(/<PartNumber>(\d+)<\/PartNumber>/g)].map(
      (match) => Number(match[1]),
    );
    expect(orderedParts).toEqual([1, 2, 3, 4, 5, 6]);
    // Progress is the contiguous watermark: strictly increasing.
    expect([...progress].sort((a, b) => a - b)).toEqual(progress);
    // The handle recorded the uploadId immediately, then each contiguous commit.
    expect(checkpoint.saves[0]).toMatchObject({ kind: "parts", uploadToken: "UP-PAR" });
    const lastSave = checkpoint.saves[checkpoint.saves.length - 1];
    expect(lastSave).toMatchObject({ committedBytes: 12 * 512, kind: "parts" });
    expect(lastSave?.kind === "parts" ? lastSave.parts : []).toHaveLength(6);
    // Clearing on success belongs to the executor, not the provider.
    expect(checkpoint.cleared()).toBe(false);
  });

  it("resumes from a unified parts checkpoint without re-initiating the upload", async () => {
    let initiateCalls = 0;
    const uploadedPartNumbers: number[] = [];
    let completeBody = "";
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        initiateCalls += 1;
        return Promise.resolve(new Response(null, { status: 500 }));
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        const partNumber = Number(new URL(url).searchParams.get("partNumber") ?? "0");
        uploadedPartNumbers.push(partNumber);
        return Promise.resolve(
          new Response(null, { headers: { etag: `"p${String(partNumber)}"` }, status: 200 }),
        );
      }
      if (init?.method === "POST" && url.includes("uploadId")) {
        completeBody = new TextDecoder().decode(init?.body as Uint8Array);
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><CompleteMultipartUploadResult><ETag>"resumed-final"</ETag></CompleteMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: 1024, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const checkpoint = createFakeCheckpoint({
      committedBytes: 2048,
      kind: "parts",
      parts: [
        { byteEnd: 1024, partNumber: 1, token: '"p1-old"' },
        { byteEnd: 2048, partNumber: 2, token: '"p2-old"' },
      ],
      partSizeBytes: 1024,
      uploadToken: "UP-RESUME",
    });
    // The executor already advanced the source: only the tail flows in.
    const result = await transfers.write(
      makeWriteRequest("/resume.bin", [new Uint8Array(1024).fill(7)], {
        checkpoint: checkpoint.handle,
        offset: 2048,
      }),
    );

    expect(initiateCalls).toBe(0);
    expect(uploadedPartNumbers).toEqual([3]);
    expect(result.bytesTransferred).toBe(3072);
    expect(result.checksum).toBe('"resumed-final"');
    // Complete includes the resumed prefix etags plus the new part
    // (quotes are XML-escaped in the body).
    expect(completeBody).toContain("&quot;p1-old&quot;");
    expect(completeBody).toContain("&quot;p2-old&quot;");
    expect(completeBody).toContain("&quot;p3&quot;");
  });

  it("rejects a resume offset that does not match the checkpoint state", async () => {
    const factory = createS3ProviderFactory({
      fetch: () => Promise.reject(new Error("no network expected")),
      multipart: { enabled: true, partSizeBytes: 1024, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const checkpoint = createFakeCheckpoint({
      committedBytes: 1024,
      kind: "parts",
      parts: [{ byteEnd: 1024, partNumber: 1, token: '"p1"' }],
      partSizeBytes: 1024,
      uploadToken: "UP-MISMATCH",
    });

    await expect(
      session.transfers?.write(
        makeWriteRequest("/mismatch.bin", [new Uint8Array(8)], {
          checkpoint: checkpoint.handle,
          offset: 4096,
        }),
      ),
    ).rejects.toMatchObject({ code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE" });
  });

  it("discards orphaned multipart state via AbortMultipartUpload", async () => {
    const aborted: string[] = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "DELETE" && url.includes("uploadId")) {
        aborted.push(new URL(url).searchParams.get("uploadId") ?? "");
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createS3ProviderFactory({ fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });

    await session.transfers?.discardResumable?.({
      endpoint: { path: "/orphan.bin", provider: "s3" },
      state: {
        committedBytes: 1024,
        kind: "parts",
        parts: [{ byteEnd: 1024, partNumber: 1, token: '"p1"' }],
        partSizeBytes: 1024,
        uploadToken: "UP-ORPHAN",
      },
    });

    expect(aborted).toEqual(["UP-ORPHAN"]);

    // Byte-offset state has no provider-side residue: no network calls.
    await session.transfers?.discardResumable?.({
      endpoint: { path: "/orphan.bin", provider: "s3" },
      state: { committedBytes: 10, kind: "byte-offset" },
    });
    expect(aborted).toHaveLength(1);
  });
});

describe("Azure staged-block resume with unified checkpoints", () => {
  function azureFactory(fetchImpl: HttpFetch, partConcurrency = 1) {
    return createAzureBlobProviderFactory({
      account: "acct",
      container: "files",
      fetch: fetchImpl,
      multipart: { enabled: true, partConcurrency, partSizeBytes: 1024, thresholdBytes: 1024 },
      sasToken: "sv=1",
    });
  }

  it("checkpoints staged blocks through the handle and commits all block ids", async () => {
    const stagedBlockIds: string[] = [];
    let blockListBody = "";
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "PUT" && url.includes("comp=block&")) {
        stagedBlockIds.push(new URL(url).searchParams.get("blockid") ?? "");
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      if (init?.method === "PUT" && url.includes("comp=blocklist")) {
        blockListBody = new TextDecoder().decode(init.body as Uint8Array);
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const session = await azureFactory(fetchImpl).create().connect({
      host: "acct",
      provider: "azure-blob",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const checkpoint = createFakeCheckpoint();
    const chunks = Array.from({ length: 6 }, (_, index) => new Uint8Array(512).fill(index));
    const result = await transfers.write(
      makeWriteRequest("/blob.bin", chunks, {
        checkpoint: checkpoint.handle,
        endpoint: { path: "/blob.bin", provider: "azure-blob" },
      }),
    );

    expect(result.bytesTransferred).toBe(3072);
    expect(stagedBlockIds).toHaveLength(3);
    const lastSave = checkpoint.saves[checkpoint.saves.length - 1];
    expect(lastSave).toMatchObject({ committedBytes: 3072, kind: "parts" });
    for (const blockId of stagedBlockIds) {
      expect(blockListBody).toContain(blockId);
    }
  });

  it("resumes staged blocks reusing the original nonce and existing block ids", async () => {
    const stagedBlockIds: string[] = [];
    let blockListBody = "";
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "PUT" && url.includes("comp=block&")) {
        stagedBlockIds.push(new URL(url).searchParams.get("blockid") ?? "");
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      if (init?.method === "PUT" && url.includes("comp=blocklist")) {
        blockListBody = new TextDecoder().decode(init.body as Uint8Array);
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const session = await azureFactory(fetchImpl).create().connect({
      host: "acct",
      provider: "azure-blob",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    // Block ids the first attempt produced with nonce "cafef00d".
    const block1 = Buffer.from("cafef00d-000000001", "utf8").toString("base64");
    const block2 = Buffer.from("cafef00d-000000002", "utf8").toString("base64");
    const checkpoint = createFakeCheckpoint({
      committedBytes: 2048,
      kind: "parts",
      parts: [
        { byteEnd: 1024, partNumber: 1, token: block1 },
        { byteEnd: 2048, partNumber: 2, token: block2 },
      ],
      partSizeBytes: 1024,
      uploadToken: "cafef00d",
    });

    const result = await transfers.write(
      makeWriteRequest("/blob.bin", [new Uint8Array(1024).fill(9)], {
        checkpoint: checkpoint.handle,
        endpoint: { path: "/blob.bin", provider: "azure-blob" },
        offset: 2048,
      }),
    );

    expect(result.bytesTransferred).toBe(3072);
    // Only the tail block was staged, numbered after the resumed prefix.
    const block3 = Buffer.from("cafef00d-000000003", "utf8").toString("base64");
    expect(stagedBlockIds).toEqual([block3]);
    // The commit lists all three blocks in order.
    const orderedIds = [...blockListBody.matchAll(/<Latest>([^<]+)<\/Latest>/g)].map(
      (match) => match[1],
    );
    expect(orderedIds).toEqual([block1, block2, block3]);
  });

  it("rejects resume without a parts checkpoint", async () => {
    const session = await azureFactory(() => Promise.reject(new Error("no network")))
      .create()
      .connect({ host: "acct", provider: "azure-blob" });

    await expect(
      session.transfers?.write(
        makeWriteRequest("/blob.bin", [new Uint8Array(8)], {
          endpoint: { path: "/blob.bin", provider: "azure-blob" },
          offset: 2048,
        }),
      ),
    ).rejects.toMatchObject({ code: "ZERO_TRANSFER_UNSUPPORTED_FEATURE" });
  });
});
