import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createDropboxProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createDropboxProviderFactory", () => {
  it("advertises Dropbox capabilities", () => {
    const factory = createDropboxProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("dropbox");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "dropbox",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("dropbox-content-hash");
  });

  it("rejects connect() without a bearer token", async () => {
    const factory = createDropboxProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "ignored", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("lists folders, paginating via /list_folder/continue", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      requests.push({
        body: typeof init?.body === "string"
          ? init.body
          : new TextDecoder().decode(init?.body as Uint8Array),
        url: input,
      });
      if (input.endsWith("/2/files/list_folder")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              cursor: "cursor-1",
              entries: [
                {
                  ".tag": "file",
                  content_hash: "abc",
                  id: "id:file-a",
                  name: "a.txt",
                  path_display: "/folder/a.txt",
                  server_modified: "2030-01-01T00:00:00Z",
                  size: 10,
                },
              ],
              has_more: true,
            }),
            { headers: { "content-type": "application/json" }, status: 200 },
          ),
        );
      }
      if (input.endsWith("/2/files/list_folder/continue")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              cursor: "cursor-2",
              entries: [
                {
                  ".tag": "folder",
                  id: "id:sub",
                  name: "sub",
                  path_display: "/folder/sub",
                },
              ],
              has_more: false,
            }),
            { headers: { "content-type": "application/json" }, status: 200 },
          ),
        );
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const session = await connect({ fetch: fetchImpl });

    const entries = await session.fs.list("/folder");

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      name: "a.txt",
      path: "/folder/a.txt",
      size: 10,
      type: "file",
      uniqueId: "abc",
    });
    expect(entries[1]).toMatchObject({
      name: "sub",
      path: "/folder/sub",
      type: "directory",
      uniqueId: "id:sub",
    });
    expect(requests[0]?.url).toBe("https://api.dropboxapi.com/2/files/list_folder");
    expect(requests[0]?.body).toContain('"path":"/folder"');
    expect(requests[1]?.url).toBe("https://api.dropboxapi.com/2/files/list_folder/continue");
    expect(requests[1]?.body).toContain('"cursor":"cursor-1"');
  });

  it("stat() returns RemoteStat with content hash and modifiedAt", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ".tag": "file",
            content_hash: "hash-1",
            id: "id:1",
            name: "file.bin",
            path_display: "/file.bin",
            server_modified: "2030-01-01T00:00:00Z",
            size: 1024,
          }),
          { headers: { "content-type": "application/json" }, status: 200 },
        ),
      );
    const session = await connect({ fetch: fetchImpl });

    const stat = await session.fs.stat("/file.bin");

    expect(stat).toMatchObject({
      exists: true,
      name: "file.bin",
      path: "/file.bin",
      size: 1024,
      type: "file",
      uniqueId: "hash-1",
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("read() POSTs to /2/files/download with Dropbox-API-Arg and returns a stream", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: {
            "content-length": "4",
            "dropbox-api-result": JSON.stringify({ content_hash: "hash-x" }),
          },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.bin"));

    expect(captured?.url).toBe("https://content.dropboxapi.com/2/files/download");
    const headers = captured?.init?.headers as Record<string, string>;
    expect(headers["Dropbox-API-Arg"]).toBe('{"path":"/file.bin"}');
    expect(headers.authorization).toBe("Bearer access-token");
    expect(result.totalBytes).toBe(4);
    expect(result.checksum).toBe("hash-x");

    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("write() POSTs to /2/files/upload with overwrite mode and returns content_hash", async () => {
    let captured: { url: string; init: RequestInit | undefined } | undefined;
    const fetchImpl: HttpFetch = (input, init) => {
      captured = { init, url: input };
      return Promise.resolve(
        new Response(
          JSON.stringify({
            ".tag": "file",
            content_hash: "hash-up",
            id: "id:up",
            name: "file.bin",
            path_display: "/file.bin",
            size: 5,
          }),
          { headers: { "content-type": "application/json" }, status: 200 },
        ),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.bin", new TextEncoder().encode("hello")),
    );

    expect(captured?.url).toBe("https://content.dropboxapi.com/2/files/upload");
    const headers = captured?.init?.headers as Record<string, string>;
    const apiArg = JSON.parse(headers["Dropbox-API-Arg"] ?? "{}") as {
      mode: string;
      path: string;
    };
    expect(apiArg).toMatchObject({ mode: "overwrite", path: "/file.bin" });
    expect(headers["content-type"]).toBe("application/octet-stream");
    expect(result.bytesTransferred).toBe(5);
    expect(result.checksum).toBe("hash-up");
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

  it("maps 401 to AuthenticationError, 403 to PermissionDeniedError, 409 not_found to PathNotFoundError", async () => {
    let attempt = 0;
    const fetchImpl: HttpFetch = () => {
      attempt += 1;
      if (attempt === 1) return Promise.resolve(new Response("unauthorized", { status: 401 }));
      if (attempt === 2) return Promise.resolve(new Response("forbidden", { status: 403 }));
      return Promise.resolve(
        new Response(
          JSON.stringify({ error: { ".tag": "path", path: { ".tag": "not_found" } } }),
          { status: 409 },
        ),
      );
    };
    const session = await connect({ fetch: fetchImpl });

    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(AuthenticationError);
    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(PermissionDeniedError);
    await expect(session.fs.stat("/a")).rejects.toBeInstanceOf(PathNotFoundError);
  });
});

const notImplementedFetch: HttpFetch = () =>
  Promise.reject(new Error("fetch should not be called"));

async function connect(opts: { fetch: HttpFetch }) {
  const factory = createDropboxProviderFactory({ fetch: opts.fetch });
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
    transferId: "dbx-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(path: string): ProviderTransferReadRequest {
  return {
    attempt: 1,
    endpoint: { path, provider: "dropbox" },
    job: { id: "dbx-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "dropbox" },
    job: { id: "dbx-write", operation: "upload" },
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
