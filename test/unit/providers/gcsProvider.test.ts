import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createGcsProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createGcsProviderFactory", () => {
  it("advertises GCS capabilities", () => {
    const factory = createGcsProviderFactory({ bucket: "data", fetch: notImplementedFetch });
    expect(factory.id).toBe("gcs");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "gcs",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("md5");
  });

  it("rejects connect() without a bearer token", async () => {
    const factory = createGcsProviderFactory({ bucket: "data", fetch: notImplementedFetch });
    await expect(factory.create().connect({ host: "", protocol: "ftp" })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
  });

  it("throws ConfigurationError when bucket is missing", () => {
    expect(() => createGcsProviderFactory({ bucket: "", fetch: notImplementedFetch })).toThrow(
      ConfigurationError,
    );
  });

  it("list() paginates GCS objects.list and splits prefixes from items", async () => {
    const requests: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      requests.push(input);
      const url = new URL(input);
      const pageToken = url.searchParams.get("pageToken");
      if (pageToken === null) {
        return Promise.resolve(
          jsonResponse({
            items: [
              {
                etag: "etag-a",
                md5Hash: "md5-a",
                name: "folder/a.txt",
                size: "10",
                updated: "2030-01-01T00:00:00Z",
              },
            ],
            nextPageToken: "tok-2",
            prefixes: ["folder/sub/"],
          }),
        );
      }
      return Promise.resolve(
        jsonResponse({
          items: [
            {
              etag: "etag-b",
              name: "folder/b.txt",
              size: "5",
            },
          ],
        }),
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
      uniqueId: "etag-a",
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
    expect(requests[0]).toContain("/storage/v1/b/data/o");
    expect(requests[0]).toContain("delimiter=%2F");
    expect(requests[0]).toContain("prefix=folder%2F");
  });

  it("stat() GETs the object resource and returns md5/etag uniqueId", async () => {
    const fetchImpl: HttpFetch = (input) => {
      expect(input).toContain("/storage/v1/b/data/o/file.bin");
      return Promise.resolve(
        jsonResponse({
          etag: "etag-1",
          md5Hash: "md5-1",
          name: "file.bin",
          size: "1024",
          updated: "2030-01-01T00:00:00Z",
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
      uniqueId: "etag-1",
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("read() GETs ?alt=media with bearer token", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: { "content-length": "4", "x-goog-hash": "md5-x" },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.bin"));

    expect(captured?.url).toContain("/storage/v1/b/data/o/file.bin?alt=media");
    const headers = captured?.init?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer access-token");
    expect(result.totalBytes).toBe(4);
    expect(result.checksum).toBe("md5-x");
    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("write() POSTs to /upload?uploadType=media&name= with the object payload", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        jsonResponse({
          md5Hash: "md5-up",
          name: "file.bin",
          size: "5",
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.bin", new TextEncoder().encode("hello")),
    );

    expect(captured?.init?.method).toBe("POST");
    expect(captured?.url).toContain("/upload/storage/v1/b/data/o");
    expect(captured?.url).toContain("uploadType=media");
    expect(captured?.url).toContain("name=file.bin");
    const headers = captured?.init?.headers as Record<string, string>;
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

  it("maps 401/403/404 to typed errors", async () => {
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
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connect(opts: { fetch: HttpFetch }) {
  const factory = createGcsProviderFactory({ bucket: "data", fetch: opts.fetch });
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
    transferId: "gcs-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(path: string): ProviderTransferReadRequest {
  return {
    attempt: 1,
    endpoint: { path, provider: "gcs" },
    job: { id: "gcs-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "gcs" },
    job: { id: "gcs-write", operation: "upload" },
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

describe("createGcsProviderFactory edge cases", () => {
  it("throws ConfigurationError when fetch is unavailable", () => {
    const original = globalThis.fetch;
    (globalThis as { fetch?: unknown }).fetch = undefined;
    try {
      expect(() => createGcsProviderFactory({ bucket: "data" })).toThrow(ConfigurationError);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = original;
    }
  });

  it("rejects connect() when bearer token resolves to empty string", async () => {
    const factory = createGcsProviderFactory({ bucket: "data", fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "", password: "", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("uses overridden apiBaseUrl and uploadBaseUrl", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(jsonResponse({ items: [] }));
    };
    const factory = createGcsProviderFactory({
      apiBaseUrl: "https://api.example.test/storage/v1/",
      bucket: "data",
      fetch: fetchImpl,
      uploadBaseUrl: "https://up.example.test/upload/storage/v1/",
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await session.fs.list("/x");
    expect(captured[0]).toMatch(/^https:\/\/api\.example\.test\/storage\/v1\/b\/data\/o/);
  });

  it("merges defaultHeaders into requests", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(jsonResponse({ items: [] }));
    };
    const factory = createGcsProviderFactory({
      bucket: "data",
      defaultHeaders: { "X-Trace": "t" },
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await session.fs.list("/x");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["X-Trace"]).toBe("t");
  });

  it("forwards profile.timeoutMs as an AbortSignal", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(jsonResponse({ items: [] }));
    };
    const factory = createGcsProviderFactory({ bucket: "data", fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
      timeoutMs: 5_000,
    });
    await session.fs.list("/x");
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("wraps fetch failures in ConnectionError", async () => {
    const factory = createGcsProviderFactory({
      bucket: "data",
      fetch: () => Promise.reject(new Error("dns")),
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    await expect(session.fs.list("/")).rejects.toMatchObject({ message: /failed/ });
  });

  it("maps 429 and 5xx response codes to ConnectionError", async () => {
    let attempt = 0;
    const fetchImpl: HttpFetch = () => {
      attempt += 1;
      if (attempt === 1) return Promise.resolve(new Response("rate", { status: 429 }));
      return Promise.resolve(new Response("server", { status: 503 }));
    };
    const session = await connect({ fetch: fetchImpl });
    await expect(session.fs.stat("/a")).rejects.toMatchObject({ message: /rate limit/ });
    await expect(session.fs.stat("/a")).rejects.toMatchObject({ message: /failed with status/ });
  });

  it("read() honors range with offset and emits bytesRead/totalBytes", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response("y", {
          headers: { "content-length": "1", "content-range": "bytes 5-5/100" },
          status: 206,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.read({ ...makeReadRequest("/x"), range: { offset: 5 } });
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["range"]).toBe("bytes=5-");
    expect(result.bytesRead).toBe(5);
    expect(result.totalBytes).toBe(100);
  });

  it("read() throws ConnectionError when response has no body", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(new Response(null, { headers: { "content-length": "0" }, status: 200 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x"))).rejects.toBeInstanceOf(ConnectionError);
  });

  it("read() falls back to content-md5 header when x-goog-hash is missing", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response("hi", {
          headers: { "content-length": "2", "content-md5": "md5-r" },
          status: 200,
        }),
      );
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.read(makeReadRequest("/x"));
    expect(result.checksum).toBe("md5-r");
  });

  it("read() maps a non-OK GET to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 401 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x"))).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("write() maps a non-OK POST to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response("forbid", { status: 403 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x", new TextEncoder().encode("y"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("list() filters items whose names do not start with the prefix", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        jsonResponse({
          items: [
            { name: "other/foo.txt", size: "1" },
            { name: "folder/keep.txt", size: "2" },
          ],
        }),
      );
    const session = await connect({ fetch: fetchImpl });
    const list = await session.fs.list("/folder");
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe("keep.txt");
  });

  it("list() filters nested object names that contain a slash", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        jsonResponse({
          items: [{ name: "folder/sub/deep.txt", size: "1" }],
        }),
      );
    const session = await connect({ fetch: fetchImpl });
    const list = await session.fs.list("/folder");
    expect(list).toHaveLength(0);
  });

  it("stat() throws PathNotFoundError when entry projection rejects the response", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(jsonResponse({ name: "" }));
    const session = await connect({ fetch: fetchImpl });
    await expect(session.fs.stat("/a/b/c.txt")).rejects.toBeInstanceOf(PathNotFoundError);
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
    await transfers.read({ ...makeReadRequest("/r"), signal: ctrl.signal });
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });
});
