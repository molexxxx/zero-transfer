import { describe, expect, it } from "vitest";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ConfigurationError,
  PathNotFoundError,
  UnsupportedFeatureError,
  createFileSystemS3MultipartResumeStore,
  createMemoryS3MultipartResumeStore,
  createS3ProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createS3ProviderFactory", () => {
  it("advertises S3 capabilities (multipart enabled by default)", () => {
    const factory = createS3ProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("s3");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "s3",
      readStream: true,
      resumeDownload: true,
      resumeUpload: true,
      stat: true,
      writeStream: true,
    });
  });

  it("advertises legacy single-shot capabilities when multipart is explicitly disabled", () => {
    const factory = createS3ProviderFactory({
      fetch: notImplementedFetch,
      multipart: { enabled: false },
    });
    expect(factory.capabilities.resumeUpload).toBe(false);
  });

  it("rejects connect() without credentials or bucket", async () => {
    const factory = createS3ProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "bucket-a", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);

    const factoryNoBucket = createS3ProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factoryNoBucket.create().connect({
        host: "",
        password: "secret",
        protocol: "ftp",
        username: "AKIA...",
      }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("signs HEAD stat() with SigV4 against the path-style URL", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        new Response(null, {
          headers: {
            "content-length": "1024",
            etag: '"e-tag-1"',
            "last-modified": "Mon, 01 Jan 2030 00:00:00 GMT",
          },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const stat = await session.fs.stat("/folder/file.txt");

    expect(captured[0]?.url).toBe("https://s3.us-east-1.amazonaws.com/bucket-a/folder/file.txt");
    expect(captured[0]?.init?.method).toBe("HEAD");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIA/);
    expect(headers.authorization).toMatch(/SignedHeaders=[a-z;-]+/);
    expect(headers.authorization).toMatch(/Signature=[0-9a-f]{64}$/);
    expect(headers["x-amz-date"]).toMatch(/^\d{8}T\d{6}Z$/);
    expect(headers["x-amz-content-sha256"]).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(stat).toMatchObject({
      exists: true,
      name: "file.txt",
      path: "/folder/file.txt",
      size: 1024,
      type: "file",
      uniqueId: '"e-tag-1"',
    });
  });

  it("lists with prefix and delimiter, parsing Contents and CommonPrefixes", async () => {
    const captured: Array<{ url: string }> = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push({ url: input });
      return Promise.resolve(
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
           <ListBucketResult>
             <Name>bucket-a</Name>
             <Prefix>folder/</Prefix>
             <Contents>
               <Key>folder/a.txt</Key>
               <Size>10</Size>
               <LastModified>2030-01-01T00:00:00.000Z</LastModified>
               <ETag>"etag-a"</ETag>
             </Contents>
             <Contents>
               <Key>folder/b.txt</Key>
               <Size>20</Size>
               <LastModified>2030-01-02T00:00:00.000Z</LastModified>
               <ETag>"etag-b"</ETag>
             </Contents>
             <CommonPrefixes><Prefix>folder/sub/</Prefix></CommonPrefixes>
           </ListBucketResult>`,
          { status: 200 },
        ),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const entries = await session.fs.list("/folder");

    const url = new URL(captured[0]!.url);
    expect(url.searchParams.get("list-type")).toBe("2");
    expect(url.searchParams.get("delimiter")).toBe("/");
    expect(url.searchParams.get("prefix")).toBe("folder/");
    expect(entries).toHaveLength(3);
    const [a, b, sub] = entries;
    expect(a).toMatchObject({ name: "a.txt", path: "/folder/a.txt", size: 10, type: "file" });
    expect(b).toMatchObject({ name: "b.txt", path: "/folder/b.txt", size: 20, type: "file" });
    expect(sub).toMatchObject({ name: "sub", path: "/folder/sub", type: "directory" });
  });

  it("downloads via GET with Range header on resume", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response("orld", {
          headers: { "content-length": "4", "content-range": "bytes 7-10/11" },
          status: 206,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.txt", { offset: 7 }));

    const headers = captured[0]?.init?.headers as Record<string, string> | undefined;
    expect(headers?.["range"]).toBe("bytes=7-");
    expect(result.totalBytes).toBe(11);
    expect(result.bytesRead).toBe(7);
  });

  it("uploads via PUT and returns etag as checksum", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(new Response(null, { headers: { etag: '"new-etag"' }, status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.txt", new TextEncoder().encode("hello")),
    );

    expect(captured[0]?.init?.method).toBe("PUT");
    expect(captured[0]?.url).toBe("https://s3.us-east-1.amazonaws.com/bucket-a/file.txt");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["content-length"]).toBe("5");
    expect(headers["x-amz-content-sha256"]).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
    expect(result.bytesTransferred).toBe(5);
    expect(result.checksum).toBe('"new-etag"');
  });

  it("rejects resumed uploads with UnsupportedFeatureError", async () => {
    const session = await connect({ fetch: notImplementedFetch });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    await expect(
      transfers.write({
        ...makeWriteRequest("/x", new Uint8Array()),
        offset: 1,
      }),
    ).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("maps 404 HEAD to PathNotFoundError", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 404 }));
    const session = await connect({ fetch: fetchImpl });
    await expect(session.fs.stat("/missing")).rejects.toBeInstanceOf(PathNotFoundError);
  });

  it("uses virtual-hosted style URLs when pathStyle is false", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(new Response(null, { status: 200 }));
    };
    const factory = createS3ProviderFactory({ fetch: fetchImpl, pathStyle: false });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIA...",
    });
    await session.fs.stat("/file.txt");
    expect(captured[0]).toBe("https://bucket-a.s3.us-east-1.amazonaws.com/file.txt");
  });

  it("advertises resumeUpload when multipart is enabled", () => {
    const factory = createS3ProviderFactory({
      fetch: notImplementedFetch,
      multipart: { enabled: true },
    });
    expect(factory.capabilities.resumeUpload).toBe(true);
  });

  it("falls back to single-shot PUT when payload is below the multipart threshold", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        new Response(null, { headers: { etag: '"small-etag"' }, status: 200 }),
      );
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: 5 * 1024 * 1024, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new Uint8Array(512);
    const result = await transfers.write(makeWriteRequest("/small.bin", payload));

    expect(captured).toHaveLength(1);
    expect(captured[0]?.init?.method).toBe("PUT");
    expect(captured[0]?.url).toBe("https://s3.us-east-1.amazonaws.com/bucket-a/small.bin");
    expect(result.bytesTransferred).toBe(512);
    expect(result.checksum).toBe('"small-etag"');
  });

  it("performs CreateMultipartUpload + UploadPart + CompleteMultipartUpload for large payloads", async () => {
    const partSize = 1024;
    const threshold = 1024;
    const totalBytes = partSize * 3 + 100; // 4 parts (3 full + 1 final 100B)
    const captured: Array<{ url: string; method: string; body: RequestInit["body"] }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const url = input;
      const method = init?.method ?? "GET";
      captured.push({ body: init?.body ?? null, method, url });
      const parsed = new URL(url);
      if (method === "POST" && parsed.searchParams.has("uploads")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <InitiateMultipartUploadResult>
               <UploadId>upload-xyz</UploadId>
             </InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (method === "PUT" && parsed.searchParams.has("partNumber")) {
        const partNumber = parsed.searchParams.get("partNumber") ?? "0";
        return Promise.resolve(
          new Response(null, {
            headers: { etag: `"part-${partNumber}-etag"` },
            status: 200,
          }),
        );
      }
      if (method === "POST" && parsed.searchParams.has("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <CompleteMultipartUploadResult>
               <ETag>"final-etag"</ETag>
             </CompleteMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      return Promise.reject(new Error(`unexpected request: ${method} ${url}`));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: partSize, thresholdBytes: threshold },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new Uint8Array(totalBytes);
    for (let i = 0; i < payload.byteLength; i += 1) payload[i] = i & 0xff;
    const result = await transfers.write(makeWriteRequest("/large.bin", payload));

    expect(result.bytesTransferred).toBe(totalBytes);
    expect(result.checksum).toBe('"final-etag"');

    const initiate = captured[0];
    expect(initiate?.method).toBe("POST");
    expect(initiate?.url).toContain("uploads=");

    const parts = captured.filter((c) => c.method === "PUT");
    expect(parts).toHaveLength(4);
    expect(parts[0]?.url).toContain("partNumber=1");
    expect(parts[1]?.url).toContain("partNumber=2");
    expect(parts[2]?.url).toContain("partNumber=3");
    expect(parts[3]?.url).toContain("partNumber=4");

    const complete = captured[captured.length - 1];
    expect(complete?.method).toBe("POST");
    expect(complete?.url).toContain("uploadId=upload-xyz");
    const completeBody = complete?.body;
    if (!(completeBody instanceof Uint8Array)) {
      throw new Error("expected Uint8Array body for CompleteMultipartUpload");
    }
    const xml = new TextDecoder().decode(completeBody);
    expect(xml).toContain("<PartNumber>1</PartNumber>");
    expect(xml).toContain("<PartNumber>4</PartNumber>");
    expect(xml).toContain("<ETag>&quot;part-1-etag&quot;</ETag>");
    expect(xml).toContain("<ETag>&quot;part-4-etag&quot;</ETag>");
  });

  it("aborts multipart upload via DELETE when a part fails", async () => {
    const captured: Array<{ url: string; method: string }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const url = input;
      const method = init?.method ?? "GET";
      captured.push({ method, url });
      const parsed = new URL(url);
      if (method === "POST" && parsed.searchParams.has("uploads")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <InitiateMultipartUploadResult>
               <UploadId>upload-abort</UploadId>
             </InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (method === "PUT" && parsed.searchParams.has("partNumber")) {
        return Promise.resolve(new Response(null, { status: 500 }));
      }
      if (method === "DELETE" && parsed.searchParams.has("uploadId")) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.reject(new Error(`unexpected request: ${method} ${url}`));
    };
    const partSize = 1024;
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: partSize, thresholdBytes: partSize },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new Uint8Array(partSize * 2 + 1);
    await expect(transfers.write(makeWriteRequest("/x.bin", payload))).rejects.toThrow();

    const deletes = captured.filter((c) => c.method === "DELETE");
    expect(deletes).toHaveLength(1);
    expect(deletes[0]?.url).toContain("uploadId=upload-abort");
  });

  it("checkpoints multipart progress to a resume store and skips abort on failure", async () => {
    const partSize = 1024;
    let partAttempts = 0;
    const fetchImpl: HttpFetch = (input, init) => {
      const method = init?.method ?? "GET";
      const parsed = new URL(input);
      if (method === "POST" && parsed.searchParams.has("uploads")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <InitiateMultipartUploadResult><UploadId>resume-1</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (method === "PUT" && parsed.searchParams.has("partNumber")) {
        partAttempts += 1;
        const partNumber = parsed.searchParams.get("partNumber") ?? "0";
        if (partAttempts === 1) {
          return Promise.resolve(
            new Response(null, { headers: { etag: '"part-1-ok"' }, status: 200 }),
          );
        }
        if (partAttempts === 2) {
          return Promise.resolve(new Response(null, { status: 500 }));
        }
        return Promise.resolve(
          new Response(null, { headers: { etag: `"part-${partNumber}-ok"` }, status: 200 }),
        );
      }
      if (method === "DELETE") {
        throw new Error("AbortMultipartUpload should not run while a resume store is configured");
      }
      return Promise.reject(new Error(`unexpected ${method} ${input}`));
    };
    const resumeStore = createMemoryS3MultipartResumeStore();
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: {
        enabled: true,
        partSizeBytes: partSize,
        resumeStore,
        thresholdBytes: partSize,
      },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new Uint8Array(partSize * 3);
    await expect(transfers.write(makeWriteRequest("/x.bin", payload))).rejects.toThrow();

    const checkpoint = await resumeStore.load({
      bucket: "bucket-a",
      jobId: "s3-write",
      path: "/x.bin",
    });
    expect(checkpoint?.uploadId).toBe("resume-1");
    expect(checkpoint?.parts).toEqual([{ byteEnd: partSize, etag: '"part-1-ok"', partNumber: 1 }]);
  });

  it("resumes multipart upload from a stored checkpoint and completes successfully", async () => {
    const partSize = 1024;
    const captured: Array<{ url: string; method: string }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const method = init?.method ?? "GET";
      captured.push({ method, url: input });
      const parsed = new URL(input);
      if (method === "PUT" && parsed.searchParams.has("partNumber")) {
        const partNumber = parsed.searchParams.get("partNumber") ?? "0";
        return Promise.resolve(
          new Response(null, { headers: { etag: `"part-${partNumber}-ok"` }, status: 200 }),
        );
      }
      if (method === "POST" && parsed.searchParams.has("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <CompleteMultipartUploadResult><ETag>"final"</ETag></CompleteMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      return Promise.reject(new Error(`unexpected ${method} ${input}`));
    };
    const resumeStore = createMemoryS3MultipartResumeStore();
    await resumeStore.save(
      { bucket: "bucket-a", jobId: "s3-write", path: "/x.bin" },
      {
        parts: [{ byteEnd: partSize, etag: '"part-1-resumed"', partNumber: 1 }],
        uploadId: "stored-upload-id",
      },
    );
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: {
        enabled: true,
        partSizeBytes: partSize,
        resumeStore,
        thresholdBytes: partSize,
      },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    // Caller pre-skips already-uploaded bytes; our request offset reflects that.
    const remaining = new Uint8Array(partSize * 2);
    const writeRequest: ProviderTransferWriteRequest = {
      ...makeWriteRequest("/x.bin", remaining),
      offset: partSize,
    };
    const result = await transfers.write(writeRequest);

    expect(result.bytesTransferred).toBe(partSize * 3);
    expect(result.checksum).toBe('"final"');

    // No CreateMultipartUpload should have been issued - we resumed.
    const initiates = captured.filter((c) => c.method === "POST" && c.url.includes("uploads="));
    expect(initiates).toHaveLength(0);

    const parts = captured.filter((c) => c.method === "PUT");
    expect(parts).toHaveLength(2);
    expect(parts[0]?.url).toContain("partNumber=2");
    expect(parts[1]?.url).toContain("partNumber=3");

    const final = await resumeStore.load({
      bucket: "bucket-a",
      jobId: "s3-write",
      path: "/x.bin",
    });
    expect(final).toBeUndefined();
  });

  it("rejects mismatched resume offsets", async () => {
    const resumeStore = createMemoryS3MultipartResumeStore();
    await resumeStore.save(
      { bucket: "bucket-a", jobId: "s3-write", path: "/x.bin" },
      {
        parts: [{ byteEnd: 4096, etag: '"a"', partNumber: 1 }],
        uploadId: "u",
      },
    );
    const factory = createS3ProviderFactory({
      fetch: notImplementedFetch,
      multipart: {
        enabled: true,
        partSizeBytes: 1024,
        resumeStore,
        thresholdBytes: 1024,
      },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    await expect(
      transfers.write({
        ...makeWriteRequest("/x.bin", new Uint8Array()),
        offset: 1234,
      }),
    ).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });
});

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connect(opts: { fetch: HttpFetch }) {
  const factory = createS3ProviderFactory({ fetch: opts.fetch });
  return factory.create().connect({
    host: "bucket-a",
    password: "secret",
    protocol: "ftp",
    username: "AKIAEXAMPLE",
  });
}

function makeProgressEvent(
  bytesTransferred: number,
  totalBytes: number | undefined,
): TransferProgressEvent {
  const event: TransferProgressEvent = {
    bytesPerSecond: 0,
    bytesTransferred,
    elapsedMs: 0,
    startedAt: new Date(0),
    transferId: "s3-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(
  path: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: 1,
    endpoint: { path, provider: "s3" },
    job: { id: "s3-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
  if (range !== undefined) request.range = range;
  return request;
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "s3" },
    job: { id: "s3-write", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function singleChunk(bytes: Uint8Array): AsyncIterable<Uint8Array> {
  return {
    [Symbol.asyncIterator]() {
      let yielded = false;
      return {
        next: () => {
          if (yielded) return Promise.resolve({ done: true as const, value: undefined });
          yielded = true;
          return Promise.resolve({ done: false as const, value: bytes });
        },
      };
    },
  };
}

function multiChunk(chunks: Uint8Array[]): AsyncIterable<Uint8Array> {
  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next: () => {
          if (i >= chunks.length) return Promise.resolve({ done: true as const, value: undefined });
          const value = chunks[i] as Uint8Array;
          i += 1;
          return Promise.resolve({ done: false as const, value });
        },
      };
    },
  };
}

describe("createFileSystemS3MultipartResumeStore", () => {
  it("rejects empty directory option", () => {
    expect(() => createFileSystemS3MultipartResumeStore({ directory: "" })).toThrow(
      ConfigurationError,
    );
  });

  it("rejects non-string directory option", () => {
    expect(() =>
      createFileSystemS3MultipartResumeStore({
        directory: undefined as unknown as string,
      }),
    ).toThrow(ConfigurationError);
  });

  it("returns undefined when no checkpoint file exists for the key", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s3-resume-"));
    try {
      const store = createFileSystemS3MultipartResumeStore({ directory: dir });
      const result = await store.load({ bucket: "b", jobId: "j", path: "/x" });
      expect(result).toBeUndefined();
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });

  it("saves, loads, and clears a checkpoint atomically", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s3-resume-"));
    try {
      const store = createFileSystemS3MultipartResumeStore({ directory: dir });
      const key = { bucket: "b", jobId: "j", path: "/x.bin" };
      const checkpoint = {
        parts: [{ byteEnd: 1024, etag: '"abc"', partNumber: 1 }],
        uploadId: "u-123",
      };
      await store.save(key, checkpoint);
      const loaded = await store.load(key);
      expect(loaded).toEqual(checkpoint);
      // Ensure no leftover .tmp files.
      const files = await readdir(dir);
      expect(files.some((f) => f.endsWith(".tmp"))).toBe(false);
      await store.clear(key);
      expect(await store.load(key)).toBeUndefined();
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });

  it("clear() is a no-op when the file is already gone", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s3-resume-"));
    try {
      const store = createFileSystemS3MultipartResumeStore({ directory: dir });
      await expect(
        store.clear({ bucket: "b", jobId: "missing", path: "/" }),
      ).resolves.toBeUndefined();
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });

  it("load() returns undefined for a malformed checkpoint file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "s3-resume-"));
    try {
      const store = createFileSystemS3MultipartResumeStore({ directory: dir });
      const key = { bucket: "b", jobId: "j", path: "/x" };
      // Save a valid file first to discover the path.
      await store.save(key, { parts: [], uploadId: "u" });
      const files = await readdir(dir);
      const file = files.find((f) => f.endsWith(".json"));
      expect(file).toBeDefined();
      // Overwrite with malformed JSON.
      const fs = await import("node:fs/promises");
      await fs.writeFile(join(dir, file!), JSON.stringify({ wrong: true }));
      const result = await store.load(key);
      expect(result).toBeUndefined();
      // Confirm the on-disk content is what we wrote (sanity check that we hit the right path).
      const raw = await readFile(join(dir, file!), "utf8");
      expect(raw).toContain("wrong");
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  });
});

describe("S3 multipart upload", () => {
  it("falls back to single-shot PUT when payload is at or below the threshold", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(new Response(null, { headers: { etag: '"e"' }, status: 200 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: 1024, thresholdBytes: 1024 * 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const small = new Uint8Array(64);
    const result = await transfers.write(makeWriteRequest("/small.bin", small));
    expect(result.bytesTransferred).toBe(64);
    expect(captured).toHaveLength(1);
    expect(captured[0]?.init?.method).toBe("PUT");
    expect(captured[0]?.url).not.toMatch(/uploads/);
  });

  it("performs a full multipart upload with CreateMultipartUpload, UploadPart x N, CompleteMultipartUpload", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    let partCount = 0;
    const resumeStore = createMemoryS3MultipartResumeStore();
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: String(input) });
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>UP-1</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        partCount += 1;
        return Promise.resolve(
          new Response(null, {
            headers: { etag: `"part-${String(partCount)}"` },
            status: 200,
          }),
        );
      }
      if (init?.method === "POST" && url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><CompleteMultipartUploadResult><ETag>"final-etag"</ETag></CompleteMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: {
        enabled: true,
        partSizeBytes: 1024,
        resumeStore,
        thresholdBytes: 1024,
      },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    // 3.5 KB payload across multiple chunks → 4 parts at 1 KB each.
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < 7; i += 1) chunks.push(new Uint8Array(512).fill(i));
    const result = await transfers.write({
      attempt: 1,
      content: multiChunk(chunks),
      endpoint: { path: "/big.bin", provider: "s3" },
      job: { id: "s3-mp", operation: "upload" },
      reportProgress: (b, t) => makeProgressEvent(b, t),
      throwIfAborted: () => undefined,
    });
    expect(partCount).toBeGreaterThanOrEqual(3);
    expect(result.bytesTransferred).toBe(7 * 512);
    expect(result.checksum).toBe('"final-etag"');
    // Resume store should be cleared after success.
    expect(
      await resumeStore.load({ bucket: "bucket-a", jobId: "s3-mp", path: "/big.bin" }),
    ).toBeUndefined();
  });

  it("resumes a multipart upload from a saved checkpoint", async () => {
    const resumeStore = createMemoryS3MultipartResumeStore();
    await resumeStore.save(
      { bucket: "bucket-a", jobId: "resume-job", path: "/r.bin" },
      {
        parts: [
          { byteEnd: 1024, etag: '"p1"', partNumber: 1 },
          { byteEnd: 2048, etag: '"p2"', partNumber: 2 },
        ],
        uploadId: "RESUME-UP",
      },
    );
    let initiateCalls = 0;
    let partCalls = 0;
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        initiateCalls += 1;
        return Promise.resolve(new Response(null, { status: 500 }));
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        partCalls += 1;
        return Promise.resolve(new Response(null, { headers: { etag: '"p-new"' }, status: 200 }));
      }
      if (init?.method === "POST" && url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><CompleteMultipartUploadResult><ETag>"final"</ETag></CompleteMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: 1024, resumeStore, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.write({
      ...makeWriteRequest("/r.bin", new Uint8Array(1024).fill(9)),
      job: { id: "resume-job", operation: "upload" },
      offset: 2048,
    });
    // No new InitiateMultipartUpload should have been issued.
    expect(initiateCalls).toBe(0);
    expect(partCalls).toBeGreaterThan(0);
    expect(result.bytesTransferred).toBeGreaterThanOrEqual(2048);
  });

  it("rejects a resume request with no stored checkpoint as UnsupportedFeatureError", async () => {
    const resumeStore = createMemoryS3MultipartResumeStore();
    const factory = createS3ProviderFactory({
      fetch: notImplementedFetch,
      multipart: { enabled: true, partSizeBytes: 1024, resumeStore, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write({
        ...makeWriteRequest("/missing.bin", new Uint8Array()),
        offset: 4096,
      }),
    ).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("rejects a resume request whose offset doesn't match the stored checkpoint", async () => {
    const resumeStore = createMemoryS3MultipartResumeStore();
    await resumeStore.save(
      { bucket: "bucket-a", jobId: "j", path: "/x.bin" },
      { parts: [{ byteEnd: 1024, etag: '"p"', partNumber: 1 }], uploadId: "u" },
    );
    const factory = createS3ProviderFactory({
      fetch: notImplementedFetch,
      multipart: { enabled: true, partSizeBytes: 1024, resumeStore, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write({
        ...makeWriteRequest("/x.bin", new Uint8Array()),
        job: { id: "j", operation: "upload" },
        offset: 9999,
      }),
    ).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("aborts the multipart upload on a part failure when no resume store is configured", async () => {
    let aborted = false;
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>UP-X</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        return Promise.resolve(new Response(null, { status: 500 }));
      }
      if (init?.method === "DELETE" && url.includes("uploadId")) {
        aborted = true;
        return Promise.resolve(new Response(null, { status: 204 }));
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
    const big = new Uint8Array(4096).fill(1);
    await expect(transfers.write(makeWriteRequest("/abort.bin", big))).rejects.toBeDefined();
    expect(aborted).toBe(true);
  });

  it("preserves the checkpoint on part failure when a resume store is configured", async () => {
    const resumeStore = createMemoryS3MultipartResumeStore();
    let aborted = false;
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>UP-Y</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        return Promise.resolve(new Response(null, { status: 500 }));
      }
      if (init?.method === "DELETE") {
        aborted = true;
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      multipart: { enabled: true, partSizeBytes: 1024, resumeStore, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const big = new Uint8Array(4096).fill(2);
    await expect(
      transfers.write({
        ...makeWriteRequest("/preserve.bin", big),
        job: { id: "preserve", operation: "upload" },
      }),
    ).rejects.toBeDefined();
    expect(aborted).toBe(false);
    expect(
      await resumeStore.load({ bucket: "bucket-a", jobId: "preserve", path: "/preserve.bin" }),
    ).toBeDefined();
  });

  it("throws ConnectionError when CreateMultipartUpload returns no UploadId", async () => {
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult></InitiateMultipartUploadResult>`,
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
    await expect(
      transfers.write(makeWriteRequest("/no-id.bin", new Uint8Array(4096))),
    ).rejects.toBeDefined();
  });

  it("throws ConnectionError when UploadPart returns no ETag", async () => {
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>UP-Z</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      if (init?.method === "DELETE") return Promise.resolve(new Response(null, { status: 204 }));
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
    await expect(
      transfers.write(makeWriteRequest("/no-etag.bin", new Uint8Array(4096))),
    ).rejects.toBeDefined();
  });

  it("escapes special XML characters in the CompleteMultipartUpload body", async () => {
    let completeBody: string | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      const url = String(input);
      if (init?.method === "POST" && url.includes("uploads") && !url.includes("uploadId")) {
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><InitiateMultipartUploadResult><UploadId>U</UploadId></InitiateMultipartUploadResult>`,
            { status: 200 },
          ),
        );
      }
      if (init?.method === "PUT" && url.includes("partNumber")) {
        return Promise.resolve(new Response(null, { headers: { etag: '"a&b<c>"' }, status: 200 }));
      }
      if (init?.method === "POST" && url.includes("uploadId")) {
        completeBody = new TextDecoder().decode(init.body as Uint8Array);
        return Promise.resolve(
          new Response(
            `<?xml version="1.0"?><CompleteMultipartUploadResult><ETag>"final"</ETag></CompleteMultipartUploadResult>`,
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
    await transfers.write(makeWriteRequest("/escape.bin", new Uint8Array(4096)));
    expect(completeBody).toContain("&amp;");
    expect(completeBody).toContain("&lt;");
    expect(completeBody).toContain("&gt;");
  });
});

describe("S3 misc paths", () => {
  it("forwards sessionToken from factory options to SigV4 signing", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(new Response(null, { status: 200 }));
    };
    const factory = createS3ProviderFactory({
      fetch: fetchImpl,
      sessionToken: "STS-TOKEN-XYZ",
    });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    await session.fs.stat("/x").catch(() => undefined);
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["x-amz-security-token"]).toBe("STS-TOKEN-XYZ");
  });

  it("uses virtual-hosted style URLs when pathStyle is false", async () => {
    const captured: Array<{ url: string }> = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push({ url: String(input) });
      return Promise.resolve(new Response(null, { status: 200 }));
    };
    const factory = createS3ProviderFactory({ fetch: fetchImpl, pathStyle: false });
    const session = await factory.create().connect({
      host: "bucket-a",
      password: "secret",
      protocol: "ftp",
      username: "AKIAEXAMPLE",
    });
    await session.fs.stat("/x").catch(() => undefined);
    expect(captured[0]?.url).toMatch(/^https:\/\/bucket-a\.s3\./);
  });

  it("propagates the request signal during reads", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(new Response("hi", { status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const ctrl = new AbortController();
    const result = await transfers.read({ ...makeReadRequest("/x"), signal: ctrl.signal });
    expect(result.content).toBeDefined();
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("read() throws ConnectionError when response has no body", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(new Response(null, { headers: { "content-length": "0" }, status: 200 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x"))).rejects.toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringMatching(/no body/),
    });
  });

  it("read() maps a 404 to PathNotFoundError", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 404 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/missing"))).rejects.toBeInstanceOf(
      PathNotFoundError,
    );
  });

  it("read() uses Range with offset+length", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response("xy", {
          headers: { "content-length": "2", "content-range": "bytes 5-6/100" },
          status: 206,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await transfers.read({ ...makeReadRequest("/x"), range: { length: 2, offset: 5 } });
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["range"]).toBe("bytes=5-6");
  });
});
