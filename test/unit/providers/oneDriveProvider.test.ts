import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  PathNotFoundError,
  PermissionDeniedError,
  UnsupportedFeatureError,
  createOneDriveProviderFactory,
  type HttpFetch,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferProgressEvent,
} from "../../../src/index";

describe("createOneDriveProviderFactory", () => {
  it("advertises OneDrive capabilities", () => {
    const factory = createOneDriveProviderFactory({ fetch: notImplementedFetch });
    expect(factory.id).toBe("one-drive");
    expect(factory.capabilities).toMatchObject({
      list: true,
      provider: "one-drive",
      readStream: true,
      resumeDownload: true,
      resumeUpload: false,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("sha256");
  });

  it("rejects connect() without a bearer token", async () => {
    const factory = createOneDriveProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("list() paginates via @odata.nextLink", async () => {
    const requests: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      requests.push(input);
      if (input.endsWith("/me/drive/root:/folder:/children")) {
        return Promise.resolve(jsonResponse({
          "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/drive/root:/folder:/children?$skiptoken=tok-2",
          value: [
            {
              file: { hashes: { sha256Hash: "sha-a" } },
              id: "id-a",
              lastModifiedDateTime: "2030-01-01T00:00:00Z",
              name: "a.txt",
              size: 10,
            },
          ],
        }));
      }
      if (input.includes("$skiptoken=tok-2")) {
        return Promise.resolve(jsonResponse({
          value: [
            {
              folder: { childCount: 0 },
              id: "id-sub",
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
    expect(requests).toHaveLength(2);
  });

  it("stat() returns RemoteStat with sha256 checksum and modifiedAt", async () => {
    const fetchImpl: HttpFetch = (input) => {
      expect(input).toBe("https://graph.microsoft.com/v1.0/me/drive/root:/file.bin:");
      return Promise.resolve(jsonResponse({
        file: { hashes: { sha256Hash: "sha-1" } },
        id: "id-1",
        lastModifiedDateTime: "2030-01-01T00:00:00Z",
        name: "file.bin",
        size: 1024,
      }));
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

  it("read() probes metadata then GETs /content with a bearer token", async () => {
    const captured: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ init, url: input });
      if (input.endsWith("/file.bin:")) {
        return Promise.resolve(jsonResponse({
          file: { hashes: { sha256Hash: "sha-x" } },
          id: "id-1",
          name: "file.bin",
          size: 4,
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
    expect(downloadCall?.url).toBe(
      "https://graph.microsoft.com/v1.0/me/drive/root:/file.bin:/content",
    );
    const headers = downloadCall?.init?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer access-token");
    expect(result.totalBytes).toBe(4);
    expect(result.checksum).toBe("sha-x");
    const chunks: Uint8Array[] = [];
    for await (const chunk of result.content) chunks.push(chunk);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("write() PUTs payload to /content and returns the file hash", async () => {
    const captured: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ init, url: input });
      return Promise.resolve(jsonResponse({
        file: { hashes: { sha256Hash: "sha-up" } },
        id: "id-up",
        name: "file.bin",
        size: 5,
      }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    const result = await transfers.write(
      makeWriteRequest("/file.bin", new TextEncoder().encode("hello")),
    );

    const uploadCall = captured.at(-1);
    expect(uploadCall?.url).toBe(
      "https://graph.microsoft.com/v1.0/me/drive/root:/file.bin:/content",
    );
    expect(uploadCall?.init?.method).toBe("PUT");
    const headers = uploadCall?.init?.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/octet-stream");
    expect(result.bytesTransferred).toBe(5);
    expect(result.checksum).toBe("sha-up");
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

  it("honors a custom driveBaseUrl for SharePoint document libraries", async () => {
    const captured: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      captured.push(input);
      return Promise.resolve(jsonResponse({ value: [] }));
    };
    const factory = createOneDriveProviderFactory({
      driveBaseUrl: "https://graph.microsoft.com/v1.0/drives/DRIVE-ID",
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({
      host: "",
      password: "access-token",
      protocol: "ftp",
    });

    await session.fs.list("/Shared Documents");

    expect(captured[0]).toBe(
      "https://graph.microsoft.com/v1.0/drives/DRIVE-ID/root:/Shared%20Documents:/children",
    );
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
  const factory = createOneDriveProviderFactory({ fetch: opts.fetch });
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
    transferId: "od-test",
  };
  if (totalBytes !== undefined) event.totalBytes = totalBytes;
  return event;
}

function makeReadRequest(path: string): ProviderTransferReadRequest {
  return {
    attempt: 1,
    endpoint: { path, provider: "one-drive" },
    job: { id: "od-read", operation: "download" },
    reportProgress: (bytesTransferred, totalBytes) =>
      makeProgressEvent(bytesTransferred, totalBytes),
    throwIfAborted: () => undefined,
  };
}

function makeWriteRequest(path: string, payload: Uint8Array): ProviderTransferWriteRequest {
  return {
    attempt: 1,
    content: singleChunk(payload),
    endpoint: { path, provider: "one-drive" },
    job: { id: "od-write", operation: "upload" },
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
