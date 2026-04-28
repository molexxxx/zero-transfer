import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createGoogleDriveProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createGoogleDriveProviderFactory", () => {
  it("advertises Google Drive capabilities", () => {
    const factory = createGoogleDriveProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("google-drive");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "google-drive",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("md5");
  });

  it("rejects connect() without a bearer token", async () => {
    const factory = createGoogleDriveProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("list() walks the path and paginates files.list", async () => {
    const requests: Array<{ url: string; method: string }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      requests.push({ method: init?.method ?? "GET", url: input });
      const url = new URL(input);
      const q = url.searchParams.get("q") ?? "";
      const pageToken = url.searchParams.get("pageToken");
      // Path resolution: find "folder" under root.
      if (q.includes("'root' in parents") && q.includes("name = 'folder'")) {
        return Promise.resolve(jsonResponse({
          files: [
            {
              id: "id-folder",
              mimeType: "application/vnd.google-apps.folder",
              name: "folder",
            },
          ],
        }));
      }
      // First listing page.
      if (q.includes("'id-folder' in parents") && pageToken === null) {
        return Promise.resolve(jsonResponse({
          files: [
            {
              id: "id-a",
              md5Checksum: "md5-a",
              mimeType: "text/plain",
              modifiedTime: "2030-01-01T00:00:00Z",
              name: "a.txt",
              size: "10",
            },
          ],
          nextPageToken: "tok-2",
        }));
      }
      // Second listing page.
      if (q.includes("'id-folder' in parents") && pageToken === "tok-2") {
        return Promise.resolve(jsonResponse({
          files: [
            {
              id: "id-sub",
              mimeType: "application/vnd.google-apps.folder",
              name: "sub",
            },
          ],
        }));
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
      uniqueId: "id-a",
    });
    expect(entries[1]).toMatchObject({
      name: "sub",
      path: "/folder/sub",
      type: "directory",
      uniqueId: "id-sub",
    });
    expect(requests.length).toBeGreaterThanOrEqual(3);
  });

  it("stat() returns RemoteStat with md5 checksum and modifiedAt", async () => {
    const fetchImpl: HttpFetch = (input) => {
      const url = new URL(input);
      const q = url.searchParams.get("q") ?? "";
      if (q.includes("name = 'file.bin'")) {
        return Promise.resolve(jsonResponse({
          files: [
            {
              id: "id-1",
              md5Checksum: "md5-1",
              mimeType: "application/octet-stream",
              modifiedTime: "2030-01-01T00:00:00Z",
              name: "file.bin",
              size: "1024",
            },
          ],
        }));
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const session = await connect({ fetch: fetchImpl });

    const stat = await session.fs.stat("/file.bin");

    expect(stat).toMatchObject({
      exists: true,
      name: "file.bin",
      path: "/file.bin",
      size: 1024,
      type: "file",
      uniqueId: "id-1",
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("read() resolves the path then GETs files/{id}?alt=media with a bearer token", async () => {
    const captured: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ init, url: input });
      const url = new URL(input);
      const q = url.searchParams.get("q");
      if (q !== null) {
        return Promise.resolve(jsonResponse({
          files: [
            {
              id: "id-1",
              md5Checksum: "md5-x",
              mimeType: "application/octet-stream",
              name: "file.bin",
              size: "4",
            },
          ],
        }));
      }
      return Promise.resolve(
        new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: { "content-length": "4" },
          status: 200,
        }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.read(makeReadRequest("/file.bin"));

    const downloadCall = captured.at(-1);
    expect(downloadCall?.url).toContain("/files/id-1");
    expect(downloadCall?.url).toContain("alt=media");
    const headers = downloadCall?.init?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer access-token");
    expect(result.totalBytes).toBe(4);
    expect(result.checksum).toBe("md5-x");
    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("write() POSTs a multipart upload to /upload/drive/v3/files when the file is new", async () => {
    const captured: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ init, url: input });
      const url = new URL(input);
      const q = url.searchParams.get("q");
      if (q !== null) {
        // Parent lookup + existing-file lookup. Both return empty.
        return Promise.resolve(jsonResponse({ files: [] }));
      }
      // Upload response.
      return Promise.resolve(jsonResponse({
        id: "id-new",
        md5Checksum: "md5-up",
        mimeType: "application/octet-stream",
        name: "file.bin",
        size: "5",
      }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.bin", new TextEncoder().encode("hello")),
    );

    const uploadCall = captured.at(-1);
    expect(uploadCall?.url).toContain("/upload/drive/v3/files");
    expect(uploadCall?.url).toContain("uploadType=multipart");
    expect(uploadCall?.init?.method).toBe("POST");
    const headers = uploadCall?.init?.headers as Record<string, string>;
    expect(headers["content-type"]).toMatch(/^multipart\/related; boundary=/);
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

    await expect(session.fs.list("/x")).rejects.toBeInstanceOf(AuthenticationError);
    await expect(session.fs.list("/x")).rejects.toBeInstanceOf(PermissionDeniedError);
    await expect(session.fs.list("/x")).rejects.toBeInstanceOf(PathNotFoundError);
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
  const factory = createGoogleDriveProviderFactory({ fetch: opts.fetch });
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
    transferId: "gdrive-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(path: string): ProviderTransferReadRequest {
  return {
    attempt: 1,
    endpoint: { path, provider: "google-drive" },
    job: { id: "gdrive-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "google-drive" },
    job: { id: "gdrive-write", operation: "upload" },
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
