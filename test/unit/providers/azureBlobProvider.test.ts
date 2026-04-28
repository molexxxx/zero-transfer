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
      resumeUpload: false,
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
