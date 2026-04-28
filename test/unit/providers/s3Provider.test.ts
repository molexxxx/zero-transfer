import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  PathNotFoundError,
  UnsupportedFeatureError,
  createS3ProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createS3ProviderFactory", () => {
  it("advertises S3 capabilities", () => {
    const factory = createS3ProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("s3");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "s3",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
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
      return Promise.resolve(
        new Response(null, { headers: { etag: '"new-etag"' }, status: 200 }),
      );
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
    expect(xml).toContain('<ETag>&quot;part-1-etag&quot;</ETag>');
    expect(xml).toContain('<ETag>&quot;part-4-etag&quot;</ETag>');
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
