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
