import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createAzureBlobProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createAzureBlobProviderFactory", () => {
  it("advertises Azure Blob capabilities", () => {
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: notImplementedFetch,
      sasToken: "sv=ignored",
    });
    expect(factory.id).toBe("azure-blob");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "azure-blob",
      readStream: true,
      resumeDownload: true,
      resumeUpload: true,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("md5");
  });

  it("requires either bearer token or SAS token at connect time", async () => {
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: notImplementedFetch,
    });
    await expect(factory.create().connect({ host: "", protocol: "ftp" })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
  });

  it("throws ConfigurationError when container is missing", () => {
    expect(() =>
      createAzureBlobProviderFactory({
        container: "",
        fetch: notImplementedFetch,
      }),
    ).toThrow(ConfigurationError);
  });

  it("list() parses ListBlobs XML, splits prefixes, and paginates via NextMarker", async () => {
    const requests: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      requests.push(input);
      const url = new URL(input);
      const marker = url.searchParams.get("marker");
      if (marker === null) {
        return Promise.resolve(
          xmlResponse(`<?xml version="1.0"?>
          <EnumerationResults>
            <Blobs>
              <Blob>
                <Name>folder/a.txt</Name>
                <Properties>
                  <Content-Length>10</Content-Length>
                  <Content-MD5>md5-a</Content-MD5>
                  <Etag>"etag-a"</Etag>
                  <Last-Modified>Tue, 01 Jan 2030 00:00:00 GMT</Last-Modified>
                </Properties>
              </Blob>
              <BlobPrefix>
                <Name>folder/sub/</Name>
              </BlobPrefix>
            </Blobs>
            <NextMarker>tok-2</NextMarker>
          </EnumerationResults>`),
        );
      }
      return Promise.resolve(
        xmlResponse(`<?xml version="1.0"?>
        <EnumerationResults>
          <Blobs>
            <Blob>
              <Name>folder/b.txt</Name>
              <Properties>
                <Content-Length>5</Content-Length>
                <Etag>"etag-b"</Etag>
              </Properties>
            </Blob>
          </Blobs>
          <NextMarker></NextMarker>
        </EnumerationResults>`),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const entries = await session.fs.list("/folder");

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      name: "a.txt",
      path: "/folder/a.txt",
      size: 10,
      type: "file",
    });
    expect(entries[1]).toMatchObject({
      name: "sub",
      path: "/folder/sub",
      type: "directory",
    });
    expect(entries[2]).toMatchObject({
      name: "b.txt",
      path: "/folder/b.txt",
      size: 5,
      type: "file",
    });
    expect(requests).toHaveLength(2);
    expect(requests[0]).toContain("restype=container");
    expect(requests[0]).toContain("comp=list");
    expect(requests[0]).toContain("prefix=folder%2F");
  });

  it("stat() issues HEAD and reads size, last-modified, and etag", async () => {
    const fetchImpl: HttpFetch = (input, init) => {
      expect(init?.method).toBe("HEAD");
      expect(input).toContain("/data/file.bin");
      return Promise.resolve(
        new Response(null, {
          headers: {
            "content-length": "1024",
            etag: '"etag-1"',
            "last-modified": "Tue, 01 Jan 2030 00:00:00 GMT",
          },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const stat = await session.fs.stat("/file.bin");

    expect(stat).toMatchObject({
      exists: true,
      name: "file.bin",
      path: "/file.bin",
      size: 1024,
      type: "file",
      uniqueId: '"etag-1"',
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("read() GETs the blob URL with bearer token + Range and returns md5 checksum", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: {
            "content-length": "4",
            "content-md5": "md5-x",
          },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read({
      ...makeReadRequest("/file.bin"),
      range: { length: 4, offset: 0 },
    });

    expect(captured?.url).toContain("/data/file.bin");
    const headers = captured?.init?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer access-token");
    expect(headers["x-ms-version"]).toBeTypeOf("string");
    expect(headers.range).toBe("bytes=0-3");
    expect(result.totalBytes).toBe(4);
    expect(result.checksum).toBe("md5-x");
    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("write() PUTs payload as a BlockBlob and forwards content-md5 from response", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        new Response(null, {
          headers: { "content-md5": "md5-up" },
          status: 201,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.bin", new TextEncoder().encode("hello")),
    );

    expect(captured?.init?.method).toBe("PUT");
    const headers = captured?.init?.headers as Record<string, string>;
    expect(headers["x-ms-blob-type"]).toBe("BlockBlob");
    expect(headers["content-type"]).toBe("application/octet-stream");
    expect(result.bytesTransferred).toBe(5);
    expect(result.checksum).toBe("md5-up");
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

  it("maps 401 → AuthenticationError, 403 → PermissionDeniedError, 404 → PathNotFoundError", async () => {
    let attempt = 0;
    const fetchImpl: HttpFetch = () => {
      attempt += 1;
      if (attempt === 1) return Promise.resolve(new Response("unauthorized", { status: 401 }));
      if (attempt === 2) return Promise.resolve(new Response("forbidden", { status: 403 }));
      return Promise.resolve(new Response("not found", { status: 404 }));
    };
    const session = await connect({ fetch: fetchImpl });

    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(AuthenticationError);
    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(PermissionDeniedError);
    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(PathNotFoundError);
  });

  it("appends the SAS token to URLs when configured without a bearer token", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(
        xmlResponse(
          `<EnumerationResults><Blobs></Blobs><NextMarker></NextMarker></EnumerationResults>`,
        ),
      );
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      sasToken: "sv=2023-11-03&sig=abc",
    });
    const session = await factory.create().connect({ host: "", protocol: "ftp" });

    await session.fs.list("/");

    expect(captured[0]).toContain("sv=2023-11-03");
    expect(captured[0]).toContain("sig=abc");
  });
});

function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "application/xml" },
    status: 200,
  });
}

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connect(opts: { fetch: HttpFetch }) {
  const factory = createAzureBlobProviderFactory({
    account: "acct",
    container: "data",
    fetch: opts.fetch,
  });
  return factory.create().connect({
    host: "",
    password: "access-token",
    protocol: "ftp",
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
    transferId: "az-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(path: string): ProviderTransferReadRequest {
  return {
    attempt: 1,
    endpoint: { path, provider: "azure-blob" },
    job: { id: "az-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "azure-blob" },
    job: { id: "az-write", operation: "upload" },
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

describe("createAzureBlobProviderFactory edge cases", () => {
  it("throws ConfigurationError when neither account nor endpoint is provided", () => {
    expect(() =>
      createAzureBlobProviderFactory({ container: "data", fetch: notImplementedFetch }),
    ).toThrow(ConfigurationError);
  });

  it("throws ConfigurationError when fetch is unavailable", () => {
    const original = globalThis.fetch;
    (globalThis as { fetch?: unknown }).fetch = undefined;
    try {
      expect(() => createAzureBlobProviderFactory({ account: "acct", container: "data" })).toThrow(
        ConfigurationError,
      );
    } finally {
      (globalThis as { fetch?: unknown }).fetch = original;
    }
  });

  it("uses an explicit endpoint when provided (Azurite-style)", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(
        new Response(`<EnumerationResults><Blobs></Blobs></EnumerationResults>`, {
          headers: { "content-type": "application/xml" },
          status: 200,
        }),
      );
    };
    const factory = createAzureBlobProviderFactory({
      container: "data",
      endpoint: "http://127.0.0.1:10000/devstoreaccount1/",
      fetch: fetchImpl,
      sasToken: "sv=t",
    });
    const session = await factory.create().connect({ host: "", protocol: "ftp" });
    await session.fs.list("/");
    expect(captured[0]).toMatch(/^http:\/\/127\.0\.0\.1:10000\/devstoreaccount1\/data/);
  });

  it("forwards apiVersion as the x-ms-version header", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response(null, { headers: { "content-length": "1" }, status: 200 }),
      );
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      apiVersion: "2099-01-01",
      container: "data",
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await session.fs.stat("/x");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["x-ms-version"]).toBe("2099-01-01");
  });

  it("merges defaultHeaders into every request", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response(null, { headers: { "content-length": "1" }, status: 200 }),
      );
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      defaultHeaders: { "X-Trace": "trace-1" },
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await session.fs.stat("/x");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["X-Trace"]).toBe("trace-1");
  });

  it("forwards profile.timeoutMs when set", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response(null, { headers: { "content-length": "1" }, status: 200 }),
      );
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
      timeoutMs: 5_000,
    });
    await session.fs.stat("/x");
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("wraps fetch failures in ConnectionError", async () => {
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: () => Promise.reject(new Error("network down")),
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await expect(session.fs.stat("/x")).rejects.toMatchObject({ message: /failed/ });
  });

  it("maps 429 throttling and 500 server errors to ConnectionError", async () => {
    let attempt = 0;
    const fetchImpl: HttpFetch = () => {
      attempt += 1;
      if (attempt === 1) return Promise.resolve(new Response("throttled", { status: 429 }));
      return Promise.resolve(new Response("oops", { status: 500 }));
    };
    const session = await connect({ fetch: fetchImpl });
    await expect(session.fs.stat("/a")).rejects.toMatchObject({ message: /throttled/ });
    await expect(session.fs.stat("/a")).rejects.toMatchObject({ message: /failed with status/ });
  });

  it("read() throws ConnectionError when response has no body", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(new Response(null, { headers: { "content-length": "0" }, status: 200 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x"))).rejects.toMatchObject({
      message: /no body/,
    });
  });

  it("read() honors range offset and reports bytesRead", async () => {
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
    const result = await transfers.read({
      ...makeReadRequest("/x"),
      range: { offset: 5 },
    });
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["range"]).toBe("bytes=5-");
    expect(result.bytesRead).toBe(5);
    expect(result.totalBytes).toBe(100);
  });

  it("read() maps a non-OK GET response to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response("nope", { status: 404 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/missing"))).rejects.toBeInstanceOf(
      PathNotFoundError,
    );
  });

  it("write() maps a non-OK PUT response to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response("forbid", { status: 403 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x", new TextEncoder().encode("y"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("write() returns content-md5 from the response when provided", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(new Response(null, { headers: { "content-md5": "md5-up" }, status: 201 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.write(
      makeWriteRequest("/x.bin", new TextEncoder().encode("hi")),
    );
    expect(result.checksum).toBe("md5-up");
  });

  it("list() decodes XML entities (&amp; etc.) in extracted blob names", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response(
          `<?xml version="1.0"?>
            <EnumerationResults><Blobs>
              <Blob><Name>folder/a&amp;b.txt</Name>
                <Properties><Content-Length>3</Content-Length></Properties>
              </Blob>
            </Blobs></EnumerationResults>`,
          { headers: { "content-type": "application/xml" }, status: 200 },
        ),
      );
    const session = await connect({ fetch: fetchImpl });
    const list = await session.fs.list("/folder");
    expect(list[0]?.name).toBe("a&b.txt");
  });

  it("list() falls back to contentMd5 / blob name when uniqueId is missing", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response(
          `<?xml version="1.0"?>
            <EnumerationResults><Blobs>
              <Blob><Name>folder/m.bin</Name>
                <Properties>
                  <Content-Length>1</Content-Length>
                  <Content-MD5>md5-x</Content-MD5>
                </Properties>
              </Blob>
              <Blob><Name>folder/n.bin</Name><Properties></Properties></Blob>
            </Blobs></EnumerationResults>`,
          { headers: { "content-type": "application/xml" }, status: 200 },
        ),
      );
    const session = await connect({ fetch: fetchImpl });
    const list = await session.fs.list("/folder");
    const m = list.find((e) => e.name === "m.bin");
    const n = list.find((e) => e.name === "n.bin");
    expect(m?.uniqueId).toBe("md5-x");
    expect(n?.uniqueId).toBe("folder/n.bin");
  });

  it("propagates request.signal during reads", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(new Response("hi", { status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const ctrl = new AbortController();
    await transfers.read({ ...makeReadRequest("/x"), signal: ctrl.signal });
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("Azure Blob multipart (staged-block) upload", () => {
  it("stages blocks and commits via Put Block List when payload exceeds threshold", async () => {
    const blockPuts: Array<{ url: string; size: number }> = [];
    let commitBody = "";
    const fetchImpl: HttpFetch = (input, init) => {
      const url = new URL(input);
      const comp = url.searchParams.get("comp");
      if (comp === "block") {
        const body = init?.body as Uint8Array;
        blockPuts.push({ size: body.byteLength, url: input });
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      if (comp === "blocklist") {
        const body = init?.body as Uint8Array;
        commitBody = new TextDecoder().decode(body);
        return Promise.resolve(
          new Response(null, { headers: { "content-md5": "md5-final" }, status: 201 }),
        );
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 4 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new TextEncoder().encode("abcdefghi"); // 9 bytes -> 4+4+1
    const result = await transfers.write(makeWriteRequest("/big.bin", payload));

    expect(blockPuts).toHaveLength(3);
    expect(blockPuts[0]?.size).toBe(4);
    expect(blockPuts[1]?.size).toBe(4);
    expect(blockPuts[2]?.size).toBe(1);
    expect(commitBody).toContain("<BlockList>");
    expect(commitBody).toContain("<Latest>");
    expect(result.bytesTransferred).toBe(9);
    expect(result.checksum).toBe("md5-final");
  });

  it("falls back to single-shot PUT when payload <= threshold", async () => {
    let calls = 0;
    let lastUrl = "";
    const fetchImpl: HttpFetch = (input) => {
      calls += 1;
      lastUrl = input;
      return Promise.resolve(new Response(null, { status: 201 }));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 4 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await transfers.write(makeWriteRequest("/small.bin", new TextEncoder().encode("abcd")));
    expect(calls).toBe(1);
    expect(lastUrl).not.toContain("comp=block");
  });

  it("uses single-shot PUT when multipart is disabled", async () => {
    let calls = 0;
    const fetchImpl: HttpFetch = () => {
      calls += 1;
      return Promise.resolve(new Response(null, { status: 201 }));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { enabled: false },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await transfers.write(
      makeWriteRequest("/big.bin", new TextEncoder().encode("abcdefghijklmno")),
    );
    expect(calls).toBe(1);
    expect(factory.capabilities.resumeUpload).toBe(false);
  });
});

describe("Azure Blob multipart hardening", () => {
  it("rejects partSizeBytes <= 0", () => {
    expect(() =>
      createAzureBlobProviderFactory({
        account: "acct",
        container: "data",
        fetch: () => Promise.resolve(new Response(null, { status: 200 })),
        multipart: { partSizeBytes: 0 },
      }),
    ).toThrow(ConfigurationError);
    expect(() =>
      createAzureBlobProviderFactory({
        account: "acct",
        container: "data",
        fetch: () => Promise.resolve(new Response(null, { status: 200 })),
        multipart: { partSizeBytes: -1 },
      }),
    ).toThrow(ConfigurationError);
  });

  it("rejects partSizeBytes above the Azure 4000 MiB per-block limit", () => {
    expect(() =>
      createAzureBlobProviderFactory({
        account: "acct",
        container: "data",
        fetch: () => Promise.resolve(new Response(null, { status: 200 })),
        multipart: { partSizeBytes: 4000 * 1024 * 1024 + 1 },
      }),
    ).toThrow(ConfigurationError);
  });

  it("rejects negative thresholdBytes", () => {
    expect(() =>
      createAzureBlobProviderFactory({
        account: "acct",
        container: "data",
        fetch: () => Promise.resolve(new Response(null, { status: 200 })),
        multipart: { thresholdBytes: -1 },
      }),
    ).toThrow(ConfigurationError);
  });

  it("respects partSize on the final flush instead of emitting one oversized block", async () => {
    const blockSizes: number[] = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const url = new URL(input);
      const comp = url.searchParams.get("comp");
      if (comp === "block") {
        blockSizes.push((init?.body as Uint8Array).byteLength);
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      if (comp === "blocklist") {
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    // Streaming a single large chunk that exceeds partSize should still split
    // into partSize-sized blocks (no oversized final block).
    const payload = new Uint8Array(13);
    await transfers.write(makeWriteRequest("/ten.bin", payload));
    expect(blockSizes).toEqual([4, 4, 4, 1]);
  });

  it("maps a non-OK Put Block response to a typed error", async () => {
    const fetchImpl: HttpFetch = (input) => {
      const url = new URL(input);
      if (url.searchParams.get("comp") === "block") {
        return Promise.resolve(new Response("denied", { status: 403 }));
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x.bin", new TextEncoder().encode("abcdefghi"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("maps a non-OK Put Block List commit to a typed error", async () => {
    const fetchImpl: HttpFetch = (input) => {
      const url = new URL(input);
      const comp = url.searchParams.get("comp");
      if (comp === "block") return Promise.resolve(new Response(null, { status: 201 }));
      if (comp === "blocklist") return Promise.resolve(new Response("nope", { status: 403 }));
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x.bin", new TextEncoder().encode("abcdefghi"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("uses distinct per-upload nonces so concurrent writers do not share block ids", async () => {
    const blockIds: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      const url = new URL(input);
      const comp = url.searchParams.get("comp");
      if (comp === "block") {
        const id = url.searchParams.get("blockid");
        if (id !== null) blockIds.push(id);
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      if (comp === "blocklist") return Promise.resolve(new Response(null, { status: 201 }));
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createAzureBlobProviderFactory({
      account: "acct",
      container: "data",
      fetch: fetchImpl,
      multipart: { partSizeBytes: 4, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await transfers.write(makeWriteRequest("/a.bin", new TextEncoder().encode("abcd")));
    await transfers.write(makeWriteRequest("/b.bin", new TextEncoder().encode("abcd")));
    expect(blockIds).toHaveLength(2);
    expect(blockIds[0]).not.toEqual(blockIds[1]);
  });
});
