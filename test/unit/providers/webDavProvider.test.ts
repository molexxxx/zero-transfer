import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createWebDavProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

const MULTISTATUS = (body: string) =>
  new Response(`<?xml version="1.0" encoding="utf-8"?>${body}`, {
    headers: { "content-type": 'application/xml; charset="utf-8"' },
    status: 207,
  });

describe("createWebDavProviderFactory", () => {
  it("advertises WebDAV capabilities", () => {
    const factory = createWebDavProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("webdav");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "webdav",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
  });

  it("performs PROPFIND for list() and parses children", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        MULTISTATUS(`
          <D:multistatus xmlns:D="DAV:">
            <D:response>
              <D:href>/files/</D:href>
              <D:propstat><D:prop>
                <D:resourcetype><D:collection/></D:resourcetype>
                <D:getlastmodified>Mon, 01 Jan 2030 00:00:00 GMT</D:getlastmodified>
              </D:prop></D:propstat>
            </D:response>
            <D:response>
              <D:href>/files/report.pdf</D:href>
              <D:propstat><D:prop>
                <D:resourcetype/>
                <D:getcontentlength>2048</D:getcontentlength>
                <D:getlastmodified>Mon, 02 Jan 2030 00:00:00 GMT</D:getlastmodified>
                <D:getetag>"etag-1"</D:getetag>
              </D:prop></D:propstat>
            </D:response>
            <D:response>
              <D:href>/files/sub/</D:href>
              <D:propstat><D:prop>
                <D:resourcetype><D:collection/></D:resourcetype>
              </D:prop></D:propstat>
            </D:response>
          </D:multistatus>
        `),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const entries = await session.fs.list("/files");

    expect(captured[0]?.init?.method).toBe("PROPFIND");
    expect((captured[0]?.init?.headers as Record<string, string>).Depth).toBe("1");
    expect(entries).toHaveLength(2);
    const [file, sub] = entries;
    expect(file).toMatchObject({
      name: "report.pdf",
      path: "/files/report.pdf",
      size: 2048,
      type: "file",
      uniqueId: '"etag-1"',
    });
    expect(file?.modifiedAt?.toISOString()).toBe("2030-01-02T00:00:00.000Z");
    expect(sub).toMatchObject({ name: "sub", path: "/files/sub", type: "directory" });
  });

  it("performs PROPFIND with Depth 0 for stat()", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        MULTISTATUS(`
          <D:multistatus xmlns:D="DAV:">
            <D:response>
              <D:href>/files/report.pdf</D:href>
              <D:propstat><D:prop>
                <D:resourcetype/>
                <D:getcontentlength>1024</D:getcontentlength>
                <D:getetag>"abc"</D:getetag>
              </D:prop></D:propstat>
            </D:response>
          </D:multistatus>
        `),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    const stat = await session.fs.stat("/files/report.pdf");

    expect((captured[0]?.init?.headers as Record<string, string>).Depth).toBe("0");
    expect(stat).toMatchObject({
      exists: true,
      name: "report.pdf",
      path: "/files/report.pdf",
      size: 1024,
      type: "file",
      uniqueId: '"abc"',
    });
  });

  it("downloads via GET with Range header on resume", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
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
    expect(headers?.["Range"]).toBe("bytes=7-");
    expect(result.totalBytes).toBe(11);
    expect(result.bytesRead).toBe(7);
  });

  it("uploads via PUT and reports the etag as checksum", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(new Response(null, { headers: { etag: '"new-etag"' }, status: 201 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/upload.txt", new TextEncoder().encode("hello")),
    );

    expect(captured[0]?.init?.method).toBe("PUT");
    expect(captured[0]?.url).toBe("http://example.com/upload.txt");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["Content-Length"]).toBe("5");
    expect(captured[0]?.init?.body).toBeInstanceOf(Uint8Array);
    expect(result.bytesTransferred).toBe(5);
    expect(result.checksum).toBe('"new-etag"');
  });

  it("streams PUT bodies when totalBytes is known", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        new Response(null, { headers: { etag: '"etag-stream"' }, status: 201 }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new TextEncoder().encode("streamed-body");
    const result = await transfers.write({
      ...makeWriteRequest("/streamed.txt", payload),
      totalBytes: payload.byteLength,
    });

    expect(captured[0]?.init?.method).toBe("PUT");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["Content-Length"]).toBe(String(payload.byteLength));
    // Streaming path: body is a ReadableStream rather than a Uint8Array.
    expect(captured[0]?.init?.body).toBeInstanceOf(ReadableStream);
    expect(result.bytesTransferred).toBe(payload.byteLength);
    expect(result.checksum).toBe('"etag-stream"');
  });

  it("buffers PUT bodies when uploadStreaming is 'never' even with totalBytes", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(new Response(null, { status: 201 }));
    };
    const factory = createWebDavProviderFactory({ fetch: fetchImpl, uploadStreaming: "never" });
    const session = await factory.create().connect({
      host: "example.com",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const payload = new TextEncoder().encode("forced-buffer");
    await transfers.write({
      ...makeWriteRequest("/buf.txt", payload),
      totalBytes: payload.byteLength,
    });
    expect(captured[0]?.init?.body).toBeInstanceOf(Uint8Array);
  });

  it("rejects resumed uploads with UnsupportedFeatureError", async () => {
    const session = await connect({ fetch: notImplementedFetch });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    await expect(
      transfers.write({
        ...makeWriteRequest("/x", new Uint8Array()),
        offset: 10,
      }),
    ).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("maps 401, 403, 404 to typed errors on PROPFIND", async () => {
    const make =
      (status: number): HttpFetch =>
      () =>
        Promise.resolve(new Response(null, { status }));

    const auth = await connect({ fetch: make(401) });
    await expect(auth.fs.stat("/x")).rejects.toBeInstanceOf(AuthenticationError);

    const forbidden = await connect({ fetch: make(403) });
    await expect(forbidden.fs.stat("/x")).rejects.toBeInstanceOf(PermissionDeniedError);

    const missing = await connect({ fetch: make(404) });
    await expect(missing.fs.stat("/x")).rejects.toBeInstanceOf(PathNotFoundError);
  });

  it("attaches Basic auth when credentials are provided", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(MULTISTATUS('<D:multistatus xmlns:D="DAV:"></D:multistatus>'));
    };
    const factory = createWebDavProviderFactory({ fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "example.com",
      password: "pw",
      protocol: "ftp",
      username: "alice",
    });
    await session.fs.list("/").catch(() => undefined);
    const headers = captured[0]?.init?.headers as Record<string, string> | undefined;
    expect(headers?.["Authorization"]).toBe(`Basic ${Buffer.from("alice:pw").toString("base64")}`);
  });

  it("throws ConfigurationError when no fetch implementation is available", () => {
    const original = globalThis.fetch;
    // Force the factory to fall back to a missing global fetch.
    (globalThis as { fetch?: unknown }).fetch = undefined;
    try {
      expect(() => createWebDavProviderFactory({})).toThrow(/fetch is unavailable/);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = original;
    }
  });

  it("respects secure=true and basePath when building the request URL", async () => {
    const captured: Array<{ url: string }> = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push({ url: String(input) });
      return Promise.resolve(MULTISTATUS('<D:multistatus xmlns:D="DAV:"></D:multistatus>'));
    };
    const factory = createWebDavProviderFactory({
      basePath: "/dav",
      fetch: fetchImpl,
      secure: true,
    });
    const session = await factory.create().connect({ host: "example.com", protocol: "ftp" });
    await session.fs.list("/files").catch(() => undefined);
    expect(captured[0]?.url).toMatch(/^https:\/\/example\.com\/dav\/files/);
  });

  it("merges defaultHeaders into every request", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(MULTISTATUS('<D:multistatus xmlns:D="DAV:"></D:multistatus>'));
    };
    const factory = createWebDavProviderFactory({
      defaultHeaders: { "X-Trace": "abc" },
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({ host: "example.com", protocol: "ftp" });
    await session.fs.list("/").catch(() => undefined);
    const headers = captured[0]?.init?.headers as Record<string, string> | undefined;
    expect(headers?.["X-Trace"]).toBe("abc");
  });

  it("forwards profile timeoutMs to dispatchRequest (AbortSignal exposed)", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(MULTISTATUS('<D:multistatus xmlns:D="DAV:"></D:multistatus>'));
    };
    const factory = createWebDavProviderFactory({ fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "example.com",
      protocol: "ftp",
      timeoutMs: 5_000,
    });
    await session.fs.list("/").catch(() => undefined);
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("parses propfind multistatus when the body lacks the standard D: prefix", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        MULTISTATUS(`
          <multistatus xmlns="DAV:">
            <response>
              <href>/file.txt</href>
              <propstat><prop>
                <resourcetype/>
                <getcontentlength>3</getcontentlength>
              </prop></propstat>
            </response>
          </multistatus>
        `),
      );
    const session = await connect({ fetch: fetchImpl });
    const stat = await session.fs.stat("/file.txt");
    expect(stat).toMatchObject({ name: "file.txt", path: "/file.txt", size: 3, type: "file" });
  });

  it("throws ProtocolError when PROPFIND returns an empty multistatus", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(MULTISTATUS('<D:multistatus xmlns:D="DAV:"></D:multistatus>'));
    const session = await connect({ fetch: fetchImpl });
    await expect(session.fs.stat("/missing")).rejects.toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringMatching(/no responses/),
    });
  });

  it("handles GET responses without etag and without content-length", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(new Response("hello", { headers: {}, status: 200 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.read(makeReadRequest("/file.txt"));
    expect(result.totalBytes).toBeUndefined();
    expect(result.checksum).toBeUndefined();
    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(Buffer.concat(chunks).toString("utf8")).toBe("hello");
  });

  it("rejects GET when the server returns no body", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response(null, {
          headers: { "content-length": "0" },
          status: 200,
        }),
      );
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/file.txt"))).rejects.toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringMatching(/no body/),
    });
  });

  it("supports GET with a range that includes a length", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(
        new Response("abc", {
          headers: { "content-length": "3", "content-range": "bytes 5-7/10" },
          status: 206,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await transfers.read(makeReadRequest("/x.txt", { length: 3, offset: 5 }));
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["Range"]).toBe("bytes=5-7");
  });

  it("maps a non-OK GET response to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 404 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/missing"))).rejects.toBeInstanceOf(
      PathNotFoundError,
    );
  });

  it("maps a non-OK PUT (buffered) response to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 403 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x", new TextEncoder().encode("x"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("maps a non-OK PUT (streaming) response to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response(null, { status: 403 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const payload = new TextEncoder().encode("body");
    await expect(
      transfers.write({ ...makeWriteRequest("/x", payload), totalBytes: payload.byteLength }),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("uses chunked streaming when uploadStreaming='always' and totalBytes is unknown", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(new Response(null, { status: 201 }));
    };
    const factory = createWebDavProviderFactory({ fetch: fetchImpl, uploadStreaming: "always" });
    const session = await factory.create().connect({ host: "example.com", protocol: "ftp" });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const payload = new TextEncoder().encode("chunky");
    const result = await transfers.write(makeWriteRequest("/c.txt", payload));
    expect(captured[0]?.init?.body).toBeInstanceOf(ReadableStream);
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["Content-Length"]).toBeUndefined();
    expect(result.bytesTransferred).toBe(payload.byteLength);
    expect(result.totalBytes).toBe(payload.byteLength);
  });

  it("filters empty chunks from streamed PUT bodies", async () => {
    let body: RequestInit["body"] | undefined;
    const fetchImpl: HttpFetch = (_input, init) => {
      body = init?.body;
      return Promise.resolve(new Response(null, { status: 201 }));
    };
    const factory = createWebDavProviderFactory({ fetch: fetchImpl, uploadStreaming: "always" });
    const session = await factory.create().connect({ host: "example.com", protocol: "ftp" });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    // eslint-disable-next-line @typescript-eslint/require-await
    async function* gen(): AsyncIterable<Uint8Array> {
      yield new TextEncoder().encode("a");
    }
    await transfers.write({
      attempt: 1,
      content: gen(),
      endpoint: { path: "/empty.txt", provider: "webdav" },
      job: { id: "j", operation: "upload" },
      reportProgress: (b, t) => makeProgressEvent(b, t),
      throwIfAborted: () => undefined,
    });
    expect(body).toBeInstanceOf(ReadableStream);
  });

  it("propagates request.signal to fetch on read and write", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(new Response("x", { status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const ctrl = new AbortController();
    await transfers.read({ ...makeReadRequest("/a"), signal: ctrl.signal });
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
    captured.length = 0;
    await transfers.write({
      ...makeWriteRequest("/b", new TextEncoder().encode("y")),
      signal: ctrl.signal,
    });
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });
});

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connect(opts: { fetch: HttpFetch }) {
  const factory = createWebDavProviderFactory({ fetch: opts.fetch });
  return factory.create().connect({ host: "example.com", protocol: "ftp" });
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
    transferId: "webdav-test",
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
    endpoint: { path, provider: "webdav" },
    job: { id: "webdav-read", operation: "download" },
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
    endpoint: { path, provider: "webdav" },
    job: { id: "webdav-write", operation: "upload" },
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
