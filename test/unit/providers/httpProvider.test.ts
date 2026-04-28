import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createHttpProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createHttpProviderFactory", () => {
  it("advertises read-only HTTP capabilities", () => {
    const factory = createHttpProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("http");
    expect(factory.capabilities).toMatchObject({
      list: false,
      provider: "http",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: false,
    });
    expect(factory.capabilities.checksum).toContain("etag");
  });

  it("performs HEAD for stat() and surfaces size, modifiedAt, and etag", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      const headers = new Headers({
        "content-length": "1024",
        etag: "\"abc123\"",
        "last-modified": "Mon, 01 Jan 2030 00:00:00 GMT",
      });
      return Promise.resolve(new Response(null, { headers, status: 200 }));
    };
    const session = await connectHttp({ fetch: fetchImpl });

    const stat = await session.fs.stat("/files/report.pdf");

    expect(captured).toHaveLength(1);
    expect(captured[0]?.url).toBe("http://example.com/files/report.pdf");
    expect(captured[0]?.init?.method).toBe("HEAD");
    expect(stat).toMatchObject({
      exists: true,
      name: "report.pdf",
      path: "/files/report.pdf",
      size: 1024,
      type: "file",
      uniqueId: "\"abc123\"",
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("downloads via GET, streaming the response body", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response("hello world", {
          headers: { "content-length": "11", etag: "\"e\"" },
          status: 200,
        }),
      );
    const session = await connectHttp({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.txt"));
    expect(result.totalBytes).toBe(11);
    expect(result.checksum).toBe("\"e\"");

    const collected = await collectChunks(result.content);
    expect(new TextDecoder().decode(collected)).toBe("hello world");
  });

  it("emits a Range header and reports total bytes from Content-Range on resume", async () => {
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
    const session = await connectHttp({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.txt", { offset: 7 }));

    const headers = captured[0]?.init?.headers as Record<string, string> | undefined;
    expect(headers?.["Range"]).toBe("bytes=7-");
    expect(result.totalBytes).toBe(11);
    expect(result.bytesRead).toBe(7);
  });

  it("attaches Basic auth headers when username/password are provided", async () => {
    const captured: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      return Promise.resolve(
        new Response(null, { headers: { "content-length": "0" }, status: 200 }),
      );
    };
    const factory = createHttpProviderFactory({ fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "example.com",
      password: "secret",
      protocol: "ftp",
      username: "user",
    });

    await session.fs.stat("/x");

    const headers = captured[0]?.init?.headers as Record<string, string> | undefined;
    expect(headers?.["Authorization"]).toBe(
      `Basic ${Buffer.from("user:secret").toString("base64")}`,
    );
  });

  it("maps 401, 403, 404 status codes to typed errors", async () => {
    const fetchOverride = (status: number): HttpFetch =>
      () => Promise.resolve(new Response(null, { status }));

    const auth = await connectHttp({ fetch: fetchOverride(401) });
    await expect(auth.fs.stat("/x")).rejects.toBeInstanceOf(AuthenticationError);

    const forbidden = await connectHttp({ fetch: fetchOverride(403) });
    await expect(forbidden.fs.stat("/x")).rejects.toBeInstanceOf(PermissionDeniedError);

    const missing = await connectHttp({ fetch: fetchOverride(404) });
    await expect(missing.fs.stat("/x")).rejects.toBeInstanceOf(PathNotFoundError);
  });

  it("rejects list() and write() with UnsupportedFeatureError", async () => {
    const session = await connectHttp({ fetch: notImplementedFetch });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    await expect(session.fs.list("/")).rejects.toBeInstanceOf(UnsupportedFeatureError);
    await expect(transfers.write(makeWriteRequest("/x"))).rejects.toBeInstanceOf(
      UnsupportedFeatureError,
    );
  });

  it("uses https when id is https", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(new Response(null, { status: 200 }));
    };
    const factory = createHttpProviderFactory({ fetch: fetchImpl, id: "https" });
    expect(factory.id).toBe("https");
    const session = await factory.create().connect({
      host: "secure.example.com",
      protocol: "ftps",
    });
    await session.fs.stat("/x");
    expect(captured[0]).toBe("https://secure.example.com/x");
  });
});

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connectHttp(opts: { fetch: HttpFetch; id?: "http" | "https" }) {
  const factory = createHttpProviderFactory({
    fetch: opts.fetch,
    ...(opts.id !== undefined ? { id: opts.id } : {}),
  });
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
    transferId: "http-test",
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
    endpoint: { path, provider: "http" },
    job: { id: "http-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
  if (range !== undefined) request.range = range;
  return request;
}

function makeWriteRequest(path: string): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: emptyAsyncIterable(),
    endpoint: { path, provider: "http" },
    job: { id: "http-write", operation: "upload" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

async function collectChunks(iter: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of iter) chunks.push(chunk);
  let total = 0;
  for (const chunk of chunks) total += chunk.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function emptyAsyncIterable(): AsyncIterable<Uint8Array> {
  return {
    [Symbol.asyncIterator]() {
      return {
        next: () => Promise.resolve({ done: true as const, value: undefined }),
      };
    },
  };
}
