/**
 * Shared HTTP transport helpers used by HTTP(S) and WebDAV providers.
 *
 * @module providers/web/httpInternals
 */
import { Buffer } from "node:buffer";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  TimeoutError,
} from "../../errors/ZeroTransferError";
import type { ConnectionProfile } from "../../types/public";

/** Fetch implementation accepted by web-family providers. */
export type HttpFetch = (input: string, init?: RequestInit) => Promise<Response>;

/** Shared session options carried by HTTP(S)-based providers. */
export interface HttpSessionTransport {
  baseUrl: URL;
  fetch: HttpFetch;
  headers: Record<string, string>;
  timeoutMs?: number;
}

/** Builds an HTTP(S) base URL from a connection profile. */
export function buildBaseUrl(
  profile: ConnectionProfile,
  options: { secure: boolean; basePath: string },
): URL {
  const protocol = options.secure ? "https:" : "http:";
  const portSegment = profile.port !== undefined ? `:${profile.port}` : "";
  const path = options.basePath.length === 0 ? "/" : ensureLeadingSlash(options.basePath);
  try {
    return new URL(`${protocol}//${profile.host}${portSegment}${path}`);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: { host: profile.host, port: profile.port },
      message: "Invalid host or basePath for HTTP-family provider",
      retryable: false,
    });
  }
}

/** Joins a base URL pathname with a normalized remote path. */
export function resolveUrl(baseUrl: URL, remotePath: string): URL {
  const trimmedBase = baseUrl.pathname.replace(/\/+$/, "");
  const suffix = remotePath === "/" ? "" : remotePath;
  const merged = new URL(baseUrl.toString());
  merged.pathname = `${trimmedBase}${suffix}`;
  return merged;
}

/** Ensures a leading slash on a pathname. */
export function ensureLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

/** Dispatches a fetch request honoring shared headers, abort, and timeout policy. */
export async function dispatchRequest(
  options: HttpSessionTransport,
  url: URL,
  init: RequestInit & { headers?: Record<string, string> },
): Promise<Response> {
  const headers = { ...options.headers, ...(init.headers ?? {}) };
  const controller = new AbortController();
  const upstreamSignal = init.signal ?? null;
  if (upstreamSignal !== null) {
    if (upstreamSignal.aborted) controller.abort(upstreamSignal.reason);
    else upstreamSignal.addEventListener("abort", () => controller.abort(upstreamSignal.reason));
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
    timer = setTimeout(
      () => controller.abort(new Error("HTTP request timed out")),
      options.timeoutMs,
    );
  }

  try {
    return await options.fetch(url.toString(), {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted && upstreamSignal?.aborted !== true) {
      throw new TimeoutError({
        cause: error,
        details: { timeoutMs: options.timeoutMs, url: url.toString() },
        message: `HTTP request to ${url.toString()} timed out after ${String(options.timeoutMs)}ms`,
        retryable: true,
      });
    }
    throw new ConnectionError({
      cause: error,
      details: { url: url.toString() },
      message: `HTTP request to ${url.toString()} failed`,
      retryable: true,
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** Parses a `Content-Range: bytes a-b/total` header. */
export function parseContentRangeTotal(value: string): number | undefined {
  const match = /\/(\d+)\s*$/.exec(value);
  if (match === null) return undefined;
  const total = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(total) ? total : undefined;
}

/** Resolves the total byte count from a response and optional range offset. */
export function parseTotalBytes(
  response: Response,
  rangeOffset: number | undefined,
): number | undefined {
  if (response.status === 206) {
    const contentRange = response.headers.get("content-range");
    if (contentRange !== null) {
      const total = parseContentRangeTotal(contentRange);
      if (total !== undefined) return total;
    }
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength === null) return undefined;
  const length = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(length) || length < 0) return undefined;
  return rangeOffset !== undefined && rangeOffset > 0 ? length + rangeOffset : length;
}

/** Formats a `Range: bytes=offset-end` header. */
export function formatRangeHeader(offset: number, length: number | undefined): string {
  if (length === undefined) return `bytes=${String(offset)}-`;
  const end = offset + length - 1;
  return `bytes=${String(offset)}-${String(end)}`;
}

/** Maps an HTTP error status to a typed SDK error. */
export function mapResponseError(response: Response, path: string): Error {
  const details = { path, status: response.status, statusText: response.statusText };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `HTTP authentication failed for ${path} (${String(response.status)})`,
      retryable: false,
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `HTTP access forbidden for ${path} (${String(response.status)})`,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `HTTP path not found: ${path}`,
      retryable: false,
    });
  }
  return new ConnectionError({
    details,
    message: `HTTP request for ${path} failed with status ${String(response.status)}`,
    retryable: response.status >= 500,
  });
}

/** Converts a Web ReadableStream to an AsyncIterable of Uint8Array. */
export async function* webStreamToAsyncIterable(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<Uint8Array> {
  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value !== undefined) yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Resolves resolved-secret variants to UTF-8 strings. */
export function secretToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return Buffer.from(value as Uint8Array).toString("utf8");
  }
  return String(value);
}
