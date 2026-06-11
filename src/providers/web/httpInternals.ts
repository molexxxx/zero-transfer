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
  ZeroTransferError,
} from "../../errors/ZeroTransferError";
import { redactUrlForLogging } from "../../logging/redaction";
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

/**
 * Validates transport security policy for an HTTP-family provider factory.
 *
 * @param input - Provider id, resolved `secure` flag, and the `enforceHttps` option.
 * @throws {@link ConfigurationError} When `enforceHttps` is enabled on a cleartext transport.
 */
export function assertHttpsEnforced(input: {
  providerId: string;
  secure: boolean;
  enforceHttps: boolean;
}): void {
  if (input.enforceHttps && !input.secure) {
    throw new ConfigurationError({
      details: { provider: input.providerId },
      message:
        `Provider "${input.providerId}" is configured with enforceHttps but its transport is ` +
        "cleartext http; set secure: true (or drop enforceHttps to explicitly accept cleartext)",
      retryable: false,
    });
  }
}

const cleartextWarnedKeys = new Set<string>();

/**
 * Emits a process warning when credentials are about to cross a cleartext connection.
 *
 * Warned once per provider/host pair per process. Suppressed entirely when the
 * transport is secure. Enable `enforceHttps` on the provider factory to turn
 * this condition into a hard {@link ConfigurationError} instead.
 *
 * @param input - Provider id, target host, and whether the profile carries credentials.
 */
export function warnCleartextCredentials(input: {
  providerId: string;
  host: string;
  hasCredentials: boolean;
}): void {
  if (!input.hasCredentials) return;
  const key = `${input.providerId}:${input.host}`;
  if (cleartextWarnedKeys.has(key)) return;
  cleartextWarnedKeys.add(key);
  process.emitWarning(
    `Provider "${input.providerId}" is sending credentials to ${input.host} over cleartext ` +
      "http; use https or set enforceHttps to block this",
    { code: "ZERO_TRANSFER_CLEARTEXT_CREDENTIALS", type: "SecurityWarning" },
  );
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
    const safeUrl = redactUrlForLogging(url);
    if (controller.signal.aborted && upstreamSignal?.aborted !== true) {
      throw new TimeoutError({
        cause: error,
        details: { timeoutMs: options.timeoutMs, url: safeUrl },
        message: `HTTP request to ${safeUrl} timed out after ${String(options.timeoutMs)}ms`,
        retryable: true,
      });
    }
    throw new ConnectionError({
      cause: error,
      details: { url: safeUrl },
      message: `HTTP request to ${safeUrl} failed`,
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

/** Maximum number of characters of an error response body retained for diagnostics. */
export const ERROR_BODY_EXCERPT_LIMIT = 2048;

/**
 * Reads a bounded excerpt of an error response body for diagnostics.
 *
 * Servers put the actionable failure reason (S3 XML error codes, WebDAV
 * exception bodies, proxy block pages) in the body, not the status line. The
 * excerpt is truncated to {@link ERROR_BODY_EXCERPT_LIMIT} characters; read
 * failures yield `undefined` rather than masking the original HTTP error.
 *
 * @param response - Non-OK response whose body has not been consumed.
 * @returns The truncated body text, or `undefined` when empty or unreadable.
 */
export async function readErrorBodyExcerpt(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text();
    if (text.length === 0) return undefined;
    return text.length > ERROR_BODY_EXCERPT_LIMIT
      ? `${text.slice(0, ERROR_BODY_EXCERPT_LIMIT)}... [truncated]`
      : text;
  } catch {
    return undefined;
  }
}

/**
 * Parses an HTTP `Retry-After` header value into a millisecond delay.
 *
 * Supports both forms defined by RFC 9110: a non-negative decimal number of
 * seconds, and an HTTP-date after which the client may retry. Date forms in
 * the past resolve to `0`. Malformed values yield `undefined` so callers fall
 * back to their own backoff schedule.
 *
 * @param value - Raw `Retry-After` header value, or `null` when absent.
 * @param now - Clock used to resolve HTTP-date values. Defaults to `Date.now`.
 * @returns The delay in milliseconds, or `undefined` when absent or unparsable.
 */
export function parseRetryAfterMs(
  value: string | null,
  now: () => number = Date.now,
): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number.parseInt(trimmed, 10);
    return Number.isFinite(seconds) ? seconds * 1000 : undefined;
  }

  // HTTP-dates always contain letters (month name, GMT); Date.parse alone is
  // too lenient and would accept bare numbers like "-5" as years.
  if (!/[A-Za-z]/.test(trimmed)) return undefined;

  const retryAt = Date.parse(trimmed);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, retryAt - now());
}

/**
 * Maps an HTTP error status to a typed SDK error, capturing a body excerpt.
 *
 * @param response - Non-OK response whose body has not been consumed.
 * @param path - Normalized remote path for error context.
 * @returns The typed error to throw, with `details.body` carrying the excerpt.
 */
export async function mapResponseErrorWithBody(response: Response, path: string): Promise<Error> {
  return mapResponseError(response, path, await readErrorBodyExcerpt(response));
}

/** Maps an HTTP error status to a typed SDK error. */
export function mapResponseError(response: Response, path: string, bodyExcerpt?: string): Error {
  const details: Record<string, unknown> = {
    path,
    status: response.status,
    statusText: response.statusText,
  };
  if (bodyExcerpt !== undefined) details["body"] = bodyExcerpt;
  if (response.status === 429 || response.status === 503) {
    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    if (retryAfterMs !== undefined) details["retryAfterMs"] = retryAfterMs;
    return new ConnectionError({
      details,
      message:
        response.status === 429
          ? `HTTP request for ${path} was rate limited (429)`
          : `HTTP service unavailable for ${path} (503)`,
      retryable: true,
    });
  }
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

/**
 * Converts a Web ReadableStream to an AsyncIterable of Uint8Array.
 *
 * Stream interruptions (the server or network dropping the connection
 * mid-body) surface from `fetch` as raw runtime errors; they are mapped here
 * to a retryable {@link ConnectionError} so retry policies treat a transfer
 * cut at byte N like any other transient network failure.
 */
export async function* webStreamToAsyncIterable(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<Uint8Array> {
  const reader = body.getReader();
  try {
    while (true) {
      let result: { done: boolean; value?: Uint8Array | undefined };
      try {
        result = await reader.read();
      } catch (error) {
        if (error instanceof ZeroTransferError) throw error;
        throw new ConnectionError({
          cause: error,
          message: "HTTP response stream was interrupted before completion",
          retryable: true,
        });
      }
      if (result.done) break;
      if (result.value !== undefined) yield result.value;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Adapts an `AsyncIterable<Uint8Array>` into a Web `ReadableStream<Uint8Array>`
 * suitable for passing as a `fetch` request body. Invokes `onChunk` after each
 * chunk is enqueued so callers can report transfer progress.
 */
export function asyncIterableToReadableStream(
  source: AsyncIterable<Uint8Array>,
  onChunk: (chunk: Uint8Array) => void,
): ReadableStream<Uint8Array> {
  const iterator = source[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done === true) {
          controller.close();
          return;
        }
        const chunk = next.value;
        if (chunk.byteLength === 0) {
          // Drop empty chunks; pull() will be invoked again on demand.
          return;
        }
        controller.enqueue(chunk);
        onChunk(chunk);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      if (typeof iterator.return === "function") {
        try {
          await iterator.return(reason);
        } catch {
          // Ignore: cancellation is best-effort.
        }
      }
    },
  });
}

/** Resolves resolved-secret variants to UTF-8 strings. */
export function secretToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return Buffer.from(value as Uint8Array).toString("utf8");
  }
  return String(value);
}
