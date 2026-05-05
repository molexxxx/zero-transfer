import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
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
      resumeUpload: true,
      stat: true,
      writeStream: true,
    });
    expect(factory.capabilities.checksum).toContain("sha256");
  });

  it("rejects connect() without a bearer token", async () => {
    const factory = createOneDriveProviderFactory({ fetch: notImplementedFetch });
    await expect(factory.create().connect({ host: "", protocol: "ftp" })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
  });

  it("list() paginates via @odata.nextLink", async () => {
    const requests: string[] = [];
    const fetchImpl: HttpFetch = (input) => {
      requests.push(input);
      if (input.endsWith("/me/drive/root:/folder:/children")) {
        return Promise.resolve(
          jsonResponse({
            "@odata.nextLink":
              "https://graph.microsoft.com/v1.0/me/drive/root:/folder:/children?$skiptoken=tok-2",
            value: [
              {
                file: { hashes: { sha256Hash: "sha-a" } },
                id: "id-a",
                lastModifiedDateTime: "2030-01-01T00:00:00Z",
                name: "a.txt",
                size: 10,
              },
            ],
          }),
        );
      }
      if (input.includes("$skiptoken=tok-2")) {
        return Promise.resolve(
          jsonResponse({
            value: [
              {
                folder: { childCount: 0 },
                id: "id-sub",
                name: "sub",
              },
            ],
          }),
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
      return Promise.resolve(
        jsonResponse({
          file: { hashes: { sha256Hash: "sha-1" } },
          id: "id-1",
          lastModifiedDateTime: "2030-01-01T00:00:00Z",
          name: "file.bin",
          size: 1024,
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
      uniqueId: "id-1",
    });
    expect(stat.modifiedAt?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });

  it("read() probes metadata then GETs /content with a bearer token", async () => {
    const captured: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      captured.push({ init, url: input });
      if (input.endsWith("/file.bin:")) {
        return Promise.resolve(
          jsonResponse({
            file: { hashes: { sha256Hash: "sha-x" } },
            id: "id-1",
            name: "file.bin",
            size: 4,
          }),
        );
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
      return Promise.resolve(
        jsonResponse({
          file: { hashes: { sha256Hash: "sha-up" } },
          id: "id-up",
          name: "file.bin",
          size: 5,
        }),
      );
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

describe("createOneDriveProviderFactory edge cases", () => {
  it("throws ConfigurationError when fetch is unavailable", () => {
    const original = globalThis.fetch;
    (globalThis as { fetch?: unknown }).fetch = undefined;
    try {
      expect(() => createOneDriveProviderFactory({})).toThrow(ConfigurationError);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = original;
    }
  });

  it("rejects connect() when bearer token resolves to empty string", async () => {
    const factory = createOneDriveProviderFactory({ fetch: notImplementedFetch });
    await expect(
      factory.create().connect({ host: "", password: "", protocol: "ftp" }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("merges defaultHeaders into requests", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(jsonResponse({ value: [] }));
    };
    const factory = createOneDriveProviderFactory({
      defaultHeaders: { "X-Trace": "t" },
      fetch: fetchImpl,
    });
    const session = await factory.create().connect({ host: "", password: "tok", protocol: "ftp" });
    await session.fs.list("/");
    const headers = captured[0]?.init?.headers as Record<string, string>;
    expect(headers["X-Trace"]).toBe("t");
  });

  it("forwards profile.timeoutMs as an AbortSignal", async () => {
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      captured.push({ ...(init !== undefined ? { init } : {}) });
      return Promise.resolve(jsonResponse({ value: [] }));
    };
    const factory = createOneDriveProviderFactory({ fetch: fetchImpl });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
      timeoutMs: 5_000,
    });
    await session.fs.list("/");
    expect(captured[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("wraps fetch failures in ConnectionError", async () => {
    const factory = createOneDriveProviderFactory({
      fetch: () => Promise.reject(new Error("dns")),
    });
    const session = await factory.create().connect({ host: "", password: "tok", protocol: "ftp" });
    await expect(session.fs.list("/")).rejects.toMatchObject({ message: /failed/ });
  });

  it("list() paginates via @odata.nextLink", async () => {
    let attempt = 0;
    const fetchImpl: HttpFetch = () => {
      attempt += 1;
      if (attempt === 1) {
        return Promise.resolve(
          jsonResponse({
            "@odata.nextLink":
              "https://graph.microsoft.com/v1.0/me/drive/root/children?$skiptoken=2",
            value: [{ id: "a", name: "a.txt", size: 1, file: { hashes: { sha256Hash: "s" } } }],
          }),
        );
      }
      return Promise.resolve(
        jsonResponse({ value: [{ id: "b", name: "sub", folder: { childCount: 0 } }] }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const list = await session.fs.list("/");
    expect(list).toHaveLength(2);
    expect(list[0]?.name).toBe("a.txt");
    expect(list[1]?.type).toBe("directory");
  });

  it("maps 429 and 5xx responses to ConnectionError", async () => {
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

  it("read() honors range with offset and reports bytesRead", async () => {
    let call = 0;
    const captured: Array<{ init?: RequestInit; url: string }> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      call += 1;
      captured.push({ ...(init !== undefined ? { init } : {}), url: input });
      if (call === 1) {
        return Promise.resolve(
          jsonResponse({
            id: "x",
            name: "x.bin",
            size: 100,
            file: { hashes: { sha1Hash: "sh1" } },
          }),
        );
      }
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
    const result = await transfers.read({ ...makeReadRequest("/x.bin"), range: { offset: 5 } });
    const headers = captured[1]?.init?.headers as Record<string, string>;
    expect(headers["range"]).toBe("bytes=5-");
    expect(result.bytesRead).toBe(5);
    expect(result.checksum).toBe("sh1");
  });

  it("read() throws ConnectionError when response has no body", async () => {
    let call = 0;
    const fetchImpl: HttpFetch = () => {
      call += 1;
      if (call === 1) return Promise.resolve(jsonResponse({ id: "x", name: "x.bin" }));
      return Promise.resolve(
        new Response(null, { headers: { "content-length": "0" }, status: 200 }),
      );
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x.bin"))).rejects.toBeInstanceOf(ConnectionError);
  });

  it("read() prefers quickXorHash when sha hashes are absent", async () => {
    let call = 0;
    const fetchImpl: HttpFetch = () => {
      call += 1;
      if (call === 1)
        return Promise.resolve(
          jsonResponse({
            file: { hashes: { quickXorHash: "qx" } },
            id: "x",
            name: "x.bin",
            size: 1,
          }),
        );
      return Promise.resolve(new Response("y", { status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.read(makeReadRequest("/x.bin"));
    expect(result.checksum).toBe("qx");
  });

  it("read() maps a non-OK GET to a typed error", async () => {
    let call = 0;
    const fetchImpl: HttpFetch = () => {
      call += 1;
      if (call === 1) return Promise.resolve(jsonResponse({ id: "x", name: "x" }));
      return Promise.resolve(new Response(null, { status: 401 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(transfers.read(makeReadRequest("/x"))).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("write() maps a non-OK PUT to a typed error", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(new Response("forbid", { status: 403 }));
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    await expect(
      transfers.write(makeWriteRequest("/x", new TextEncoder().encode("y"))),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("write() returns sha256 from response when available", async () => {
    const fetchImpl: HttpFetch = () =>
      Promise.resolve(
        jsonResponse({
          file: { hashes: { sha256Hash: "sh256" } },
          id: "x",
          name: "x.bin",
        }),
      );
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.write(
      makeWriteRequest("/x.bin", new TextEncoder().encode("hi")),
    );
    expect(result.checksum).toBe("sh256");
  });

  it("propagates request.signal during reads", async () => {
    let call = 0;
    const captured: Array<{ init?: RequestInit }> = [];
    const fetchImpl: HttpFetch = (_input, init) => {
      call += 1;
      captured.push({ ...(init !== undefined ? { init } : {}) });
      if (call === 1) return Promise.resolve(jsonResponse({ id: "x", name: "x" }));
      return Promise.resolve(new Response("hi", { status: 200 }));
    };
    const session = await connect({ fetch: fetchImpl });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const ctrl = new AbortController();
    await transfers.read({ ...makeReadRequest("/r"), signal: ctrl.signal });
    expect(captured[1]?.init?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("OneDrive upload sessions", () => {
  it("creates an upload session and PUTs Content-Range chunks when payload exceeds threshold", async () => {
    const calls: Array<{
      url: string;
      method: string;
      headers: Record<string, string>;
      bodySize: number;
    }> = [];
    const uploadUrl = "https://upload.example/upload-session-xyz";
    const fetchImpl: HttpFetch = (input, init) => {
      const method = String(init?.method ?? "GET");
      const headers = (init?.headers ?? {}) as Record<string, string>;
      const body = init?.body as Uint8Array | undefined;
      calls.push({ bodySize: body?.byteLength ?? 0, headers, method, url: input });
      if (input.endsWith("/createUploadSession")) {
        return Promise.resolve(jsonResponse({ uploadUrl }));
      }
      if (input === uploadUrl) {
        const range = headers["content-range"] ?? "";
        const match = /bytes (\d+)-(\d+)\/(\d+)/.exec(range);
        if (match === null) return Promise.reject(new Error(`bad range: ${range}`));
        const end = Number(match[2]);
        const total = Number(match[3]);
        if (end + 1 < total) return Promise.resolve(new Response(null, { status: 202 }));
        return Promise.resolve(
          jsonResponse({
            file: { hashes: { sha256Hash: "sha-final" } },
            id: "id-1",
            name: "big.bin",
          }),
        );
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: 320 * 1024, thresholdBytes: 4 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");

    // 320 KiB + 5 bytes -> two PUTs (one full chunk + a final chunk).
    const part = new Uint8Array(320 * 1024).fill(3);
    const tail = new TextEncoder().encode("final");
    const combined = new Uint8Array(part.byteLength + tail.byteLength);
    combined.set(part, 0);
    combined.set(tail, part.byteLength);
    const result = await transfers.write(makeWriteRequest("/big.bin", combined));

    const initiate = calls.find((c) => c.url.endsWith("/createUploadSession"));
    expect(initiate?.method).toBe("POST");
    const sessionPuts = calls.filter((c) => c.url === uploadUrl);
    expect(sessionPuts).toHaveLength(2);
    // The pre-signed upload URL must NOT carry the Graph bearer token.
    expect(sessionPuts[0]?.headers.authorization).toBeUndefined();
    expect(sessionPuts[0]?.headers["content-range"]).toBe(
      `bytes 0-${String(320 * 1024 - 1)}/${String(combined.byteLength)}`,
    );
    expect(result.bytesTransferred).toBe(combined.byteLength);
    expect(result.checksum).toBe("sha-final");
  });

  it("falls back to single-shot PUT when payload <= threshold", async () => {
    let calls = 0;
    let lastUrl = "";
    const fetchImpl: HttpFetch = (input) => {
      calls += 1;
      lastUrl = input;
      return Promise.resolve(jsonResponse({ file: { hashes: { sha256Hash: "small" } } }));
    };
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: 320 * 1024, thresholdBytes: 1024 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const result = await transfers.write(
      makeWriteRequest("/x.bin", new TextEncoder().encode("hi")),
    );
    expect(calls).toBe(1);
    expect(lastUrl).toContain("/content");
    expect(result.checksum).toBe("small");
  });

  it("rejects partSizeBytes that is not a multiple of 320 KiB", () => {
    expect(() =>
      createOneDriveProviderFactory({
        fetch: notImplementedFetch,
        multipart: { partSizeBytes: 1000 },
      }),
    ).toThrow(ConfigurationError);
  });
});

describe("OneDrive multipart hardening", () => {
  it("rejects partSizeBytes <= 0", () => {
    expect(() =>
      createOneDriveProviderFactory({
        fetch: notImplementedFetch,
        multipart: { partSizeBytes: 0 },
      }),
    ).toThrow(ConfigurationError);
  });

  it("rejects negative thresholdBytes", () => {
    expect(() =>
      createOneDriveProviderFactory({
        fetch: notImplementedFetch,
        multipart: { thresholdBytes: -1 },
      }),
    ).toThrow(ConfigurationError);
  });

  it("throws ConnectionError when createUploadSession returns no uploadUrl", async () => {
    const fetchImpl: HttpFetch = () => Promise.resolve(jsonResponse({}));
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: 320 * 1024, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const big = new Uint8Array(320 * 1024 + 5);
    await expect(transfers.write(makeWriteRequest("/x.bin", big))).rejects.toBeInstanceOf(
      ConnectionError,
    );
  });

  it("issues best-effort DELETE on the uploadUrl when a chunk PUT fails", async () => {
    const uploadUrl = "https://upload.example/abort-od";
    let deleted = false;
    const fetchImpl: HttpFetch = (input, init) => {
      const method = String(init?.method ?? "GET");
      if (input.endsWith("/createUploadSession")) {
        return Promise.resolve(jsonResponse({ uploadUrl }));
      }
      if (input === uploadUrl && method === "PUT") {
        return Promise.resolve(new Response("forbid", { status: 403 }));
      }
      if (input === uploadUrl && method === "DELETE") {
        deleted = true;
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: 320 * 1024, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const big = new Uint8Array(320 * 1024 + 5);
    await expect(transfers.write(makeWriteRequest("/x.bin", big))).rejects.toBeInstanceOf(
      PermissionDeniedError,
    );
    expect(deleted).toBe(true);
  });

  it("does not forward the Graph bearer token to the pre-signed uploadUrl", async () => {
    const uploadUrl = "https://upload.example/no-bearer";
    const sessionAuthHeaders: Array<string | undefined> = [];
    const fetchImpl: HttpFetch = (input, init) => {
      const headers = (init?.headers ?? {}) as Record<string, string>;
      const method = String(init?.method ?? "GET");
      if (input.endsWith("/createUploadSession")) {
        // Initial request must carry the bearer token.
        expect(headers.authorization).toMatch(/^Bearer /u);
        return Promise.resolve(jsonResponse({ uploadUrl }));
      }
      if (input === uploadUrl && method === "PUT") {
        sessionAuthHeaders.push(headers.authorization);
        const range = headers["content-range"] ?? "";
        const match = /bytes (\d+)-(\d+)\/(\d+)/.exec(range);
        if (match === null) return Promise.reject(new Error(`bad range: ${range}`));
        const end = Number(match[2]);
        const total = Number(match[3]);
        if (end + 1 < total) return Promise.resolve(new Response(null, { status: 202 }));
        return Promise.resolve(jsonResponse({ file: { hashes: { sha256Hash: "x" } } }));
      }
      return Promise.reject(new Error(`unexpected url: ${input}`));
    };
    const factory = createOneDriveProviderFactory({
      fetch: fetchImpl,
      multipart: { partSizeBytes: 320 * 1024, thresholdBytes: 0 },
    });
    const session = await factory.create().connect({
      host: "",
      password: "tok",
      protocol: "ftp",
    });
    const transfers = session.transfers;
    if (transfers === undefined) throw new Error("Expected transfers");
    const big = new Uint8Array(320 * 1024 + 5);
    await transfers.write(makeWriteRequest("/x.bin", big));
    expect(sessionAuthHeaders.length).toBeGreaterThanOrEqual(2);
    for (const auth of sessionAuthHeaders) {
      expect(auth).toBeUndefined();
    }
  });
});
