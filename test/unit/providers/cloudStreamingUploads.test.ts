import { describe, expect, it } from "vitest";
import {
  createDropboxProviderFactory,
  createGcsProviderFactory,
  createGoogleDriveProviderFactory,
  createOneDriveProviderFactory,
  type HttpFetch,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

const PART = 256 * 1024;
const THRESHOLD = 256 * 1024;

function makeProgressEvent(
  bytesTransferred: number,
  totalBytes: number | undefined,
): TransferProgressEvent {
  const event: TransferProgressEvent = {
    bytesPerSecond: 0,
    bytesTransferred,
    elapsedMs: 0,
    startedAt: new Date(0),
    transferId: "stream-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

/** Yields `total` patterned bytes in chunks that do not align with part sizes. */
async function* patternedChunks(total: number, chunkSize = 100_000): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  let produced = 0;
  while (produced < total) {
    const size = Math.min(chunkSize, total - produced);
    const chunk = new Uint8Array(size);
    for (let index = 0; index < size; index += 1) chunk[index] = (produced + index) % 251;
    produced += size;
    yield chunk;
  }
}

function expectedBytes(total: number): Uint8Array {
  const out = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) out[index] = index % 251;
  return out;
}

function makeWriteRequest(
  path: string,
  total: number,
  overrides: Partial<ProviderTransferWriteRequest> = {},
): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: patternedChunks(total),
    endpoint: { path },
    job: { id: "stream-job", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
    ...overrides,
  };
}

function bodyBytes(init: RequestInit | undefined): Uint8Array {
  const body = init?.body;
  if (body instanceof Uint8Array) return body;
  throw new Error("expected a Uint8Array request body");
}

describe("Dropbox upload sessions", () => {
  it("streams large payloads through start/append_v2/finish with sequential cursors", async () => {
    const total = PART * 2 + 1234;
    const appends: Array<{ offset: number; bytes: Uint8Array }> = [];
    let startBytes: Uint8Array | undefined;
    let finishArg: { cursor?: { offset?: number }; commit?: { path?: string } } = {};
    const fetchImpl: HttpFetch = (input, init) => {
      const headers = init?.headers as Record<string, string>;
      const arg = JSON.parse(headers["Dropbox-API-Arg"] ?? "{}") as {
        cursor?: { offset?: number; session_id?: string };
        commit?: { path?: string };
      };
      if (input.endsWith("/upload_session/start")) {
        startBytes = bodyBytes(init);
        return Promise.resolve(
          new Response(JSON.stringify({ session_id: "sess-1" }), { status: 200 }),
        );
      }
      if (input.endsWith("/upload_session/append_v2")) {
        expect(arg.cursor?.session_id).toBe("sess-1");
        appends.push({ bytes: bodyBytes(init), offset: arg.cursor?.offset ?? -1 });
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      if (input.endsWith("/upload_session/finish")) {
        finishArg = arg;
        return Promise.resolve(
          new Response(JSON.stringify({ content_hash: "hash-1", name: "big.bin" }), {
            status: 200,
          }),
        );
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createDropboxProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "dropbox",
    });

    const result = await session.transfers?.write(makeWriteRequest("/big.bin", total));

    expect(result?.bytesTransferred).toBe(total);
    expect(result?.checksum).toBe("hash-1");
    // Appends are protocol-sequential with cursor offsets matching prior bytes.
    expect(appends.map((append) => append.offset)).toEqual([PART, PART * 2]);
    expect(finishArg.cursor?.offset).toBe(total);
    expect(finishArg.commit?.path).toBe("/big.bin");
    // The bytes reassemble exactly: start part + appends in order.
    const all = new Uint8Array(total);
    all.set(startBytes ?? new Uint8Array(0), 0);
    for (const append of appends) all.set(append.bytes, append.offset);
    expect(all).toEqual(expectedBytes(total));
  });

  it("falls back to single-shot /2/files/upload at or below the threshold", async () => {
    const urls: string[] = [];
    const fetchImpl: HttpFetch = (input, init) => {
      urls.push(input);
      expect(bodyBytes(init)).toEqual(expectedBytes(THRESHOLD));
      return Promise.resolve(
        new Response(JSON.stringify({ content_hash: "small-hash" }), { status: 200 }),
      );
    };
    const factory = createDropboxProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "dropbox",
    });

    const result = await session.transfers?.write(makeWriteRequest("/small.bin", THRESHOLD));

    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("/2/files/upload");
    expect(result?.checksum).toBe("small-hash");
  });
});

describe("Google Drive resumable sessions", () => {
  function driveFetch(puts: Array<{ range: string; bytes: Uint8Array }>, total: number): HttpFetch {
    return (input, init) => {
      const headers = init?.headers as Record<string, string>;
      if (input.includes("uploadType=resumable")) {
        return Promise.resolve(
          new Response(null, {
            headers: { location: "https://upload.example/session?upload_id=abc" },
            status: 200,
          }),
        );
      }
      if (input.startsWith("https://upload.example/session")) {
        const range = headers["content-range"] ?? "";
        const bytes = bodyBytes(init);
        puts.push({ bytes, range });
        const sent = puts.reduce((sum, put) => sum + put.bytes.byteLength, 0);
        if (sent >= total) {
          return Promise.resolve(
            new Response(JSON.stringify({ id: "f1", md5Checksum: "drive-md5" }), { status: 200 }),
          );
        }
        return Promise.resolve(new Response(null, { status: 308 }));
      }
      // findExisting search + parent resolution.
      if (input.includes("/files?")) {
        return Promise.resolve(new Response(JSON.stringify({ files: [] }), { status: 200 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
  }

  it("streams chunks with unknown totals and finalizes with the real size", async () => {
    const total = PART * 2 + 999;
    const puts: Array<{ range: string; bytes: Uint8Array }> = [];
    const factory = createGoogleDriveProviderFactory({
      fetch: driveFetch(puts, total),
      multipart: { partSizeBytes: PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "google-drive",
    });

    const result = await session.transfers?.write(makeWriteRequest("/big.bin", total));

    expect(result?.bytesTransferred).toBe(total);
    expect(result?.checksum).toBe("drive-md5");
    expect(puts.map((put) => put.range)).toEqual([
      `bytes 0-${String(PART - 1)}/*`,
      `bytes ${String(PART)}-${String(PART * 2 - 1)}/*`,
      `bytes ${String(PART * 2)}-${String(total - 1)}/${String(total)}`,
    ]);
    const all = new Uint8Array(total);
    let offset = 0;
    for (const put of puts) {
      all.set(put.bytes, offset);
      offset += put.bytes.byteLength;
    }
    expect(all).toEqual(expectedBytes(total));
  });

  it("finalizes payloads that are exact multiples of the part size", async () => {
    const total = PART * 2;
    const puts: Array<{ range: string; bytes: Uint8Array }> = [];
    const factory = createGoogleDriveProviderFactory({
      fetch: driveFetch(puts, total),
      multipart: { partSizeBytes: PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "google-drive",
    });

    const result = await session.transfers?.write(makeWriteRequest("/exact.bin", total));

    expect(result?.bytesTransferred).toBe(total);
    // The lookahead marks the second chunk as final with the real total.
    expect(puts.map((put) => put.range)).toEqual([
      `bytes 0-${String(PART - 1)}/*`,
      `bytes ${String(PART)}-${String(PART * 2 - 1)}/${String(PART * 2)}`,
    ]);
  });
});

describe("GCS resumable sessions (part-reader)", () => {
  it("finalizes payloads that are exact multiples of the part size", async () => {
    const total = PART * 2;
    const puts: string[] = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const headers = init?.headers as Record<string, string>;
      if (input.includes("uploadType=resumable")) {
        return Promise.resolve(
          new Response(null, {
            headers: { location: "https://gcs.example/session?upload_id=xyz" },
            status: 200,
          }),
        );
      }
      if (input.startsWith("https://gcs.example/session")) {
        puts.push(headers["content-range"] ?? "");
        const isFinal = !(headers["content-range"] ?? "").endsWith("/*");
        return Promise.resolve(
          isFinal
            ? new Response(JSON.stringify({ md5Hash: "gcs-md5", name: "exact.bin" }), {
                status: 200,
              })
            : new Response(null, { status: 308 }),
        );
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createGcsProviderFactory({
      bucket: "bucket-a",
      fetch: fetchImpl,
      multipart: { partSizeBytes: PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "token",
      provider: "gcs",
    });

    const result = await session.transfers?.write(makeWriteRequest("/exact.bin", total));

    expect(result?.bytesTransferred).toBe(total);
    expect(result?.checksum).toBe("gcs-md5");
    expect(puts).toEqual([
      `bytes 0-${String(PART - 1)}/*`,
      `bytes ${String(PART)}-${String(PART * 2 - 1)}/${String(PART * 2)}`,
    ]);
  });
});

describe("OneDrive upload sessions", () => {
  // Graph requires 320 KiB-aligned chunks.
  const OD_PART = 320 * 1024;

  it("streams without buffering when totalBytes is known", async () => {
    const total = OD_PART * 2 + 555;
    const puts: Array<{ range: string; bytes: Uint8Array }> = [];
    let sourceFullyConsumedBeforeFirstPut: boolean | undefined;
    let produced = 0;

    const fetchImpl: HttpFetch = (input, init) => {
      const headers = init?.headers as Record<string, string>;
      if (input.endsWith("/createUploadSession")) {
        return Promise.resolve(
          new Response(JSON.stringify({ uploadUrl: "https://graph.example/upload/abc" }), {
            status: 200,
          }),
        );
      }
      if (input.startsWith("https://graph.example/upload/")) {
        if (init?.method !== "DELETE") {
          if (sourceFullyConsumedBeforeFirstPut === undefined) {
            sourceFullyConsumedBeforeFirstPut = produced >= total;
          }
          puts.push({ bytes: bodyBytes(init), range: headers["content-range"] ?? "" });
          const sent = puts.reduce((sum, put) => sum + put.bytes.byteLength, 0);
          if (sent >= total) {
            return Promise.resolve(
              new Response(
                JSON.stringify({ file: { hashes: { sha256Hash: "od-sha" } }, name: "big.bin" }),
                { status: 200 },
              ),
            );
          }
          return Promise.resolve(new Response(null, { status: 202 }));
        }
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };

    async function* trackedChunks(): AsyncGenerator<Uint8Array> {
      for await (const chunk of patternedChunks(total)) {
        produced += chunk.byteLength;
        yield chunk;
      }
    }

    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: OD_PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "onedrive",
    });

    const result = await session.transfers?.write(
      makeWriteRequest("/big.bin", total, { content: trackedChunks(), totalBytes: total }),
    );

    expect(result?.bytesTransferred).toBe(total);
    // The first session PUT happened before the source was fully consumed:
    // the payload streamed instead of being buffered.
    expect(sourceFullyConsumedBeforeFirstPut).toBe(false);
    // Graph requires the total in every Content-Range.
    expect(puts.map((put) => put.range)).toEqual([
      `bytes 0-${String(OD_PART - 1)}/${String(total)}`,
      `bytes ${String(OD_PART)}-${String(OD_PART * 2 - 1)}/${String(total)}`,
      `bytes ${String(OD_PART * 2)}-${String(total - 1)}/${String(total)}`,
    ]);
    const all = new Uint8Array(total);
    let offset = 0;
    for (const put of puts) {
      all.set(put.bytes, offset);
      offset += put.bytes.byteLength;
    }
    expect(all).toEqual(expectedBytes(total));
  });

  it("cancels the session when content exceeds the declared totalBytes", async () => {
    const declared = OD_PART;
    let sessionDeleted = false;
    const fetchImpl: HttpFetch = (input, init) => {
      if (input.endsWith("/createUploadSession")) {
        return Promise.resolve(
          new Response(JSON.stringify({ uploadUrl: "https://graph.example/upload/abc" }), {
            status: 200,
          }),
        );
      }
      if (input.startsWith("https://graph.example/upload/")) {
        if (init?.method === "DELETE") {
          sessionDeleted = true;
          return Promise.resolve(new Response(null, { status: 204 }));
        }
        return Promise.resolve(new Response(null, { status: 202 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: OD_PART, thresholdBytes: THRESHOLD },
    });
    const session = await factory.create().connect({
      host: "",
      password: "token",
      provider: "onedrive",
    });

    await expect(
      session.transfers?.write(
        // Actual content is twice the declared size.
        makeWriteRequest("/liar.bin", declared * 2, { totalBytes: declared }),
      ),
    ).rejects.toMatchObject({ code: "ZERO_TRANSFER_CONFIGURATION_ERROR" });
    // Give the fire-and-forget DELETE a tick to land.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sessionDeleted).toBe(true);
  });
});
