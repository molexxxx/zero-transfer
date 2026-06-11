import { describe, expect, it } from "vitest";
import { ConnectionError } from "../../../src/index";
import { mapResponseError, parseRetryAfterMs } from "../../../src/providers/web/httpInternals";

function createResponse(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { headers, status, statusText: `status-${String(status)}` });
}

describe("parseRetryAfterMs", () => {
  it("parses delay-seconds into milliseconds", () => {
    expect(parseRetryAfterMs("0")).toBe(0);
    expect(parseRetryAfterMs("1")).toBe(1000);
    expect(parseRetryAfterMs("120")).toBe(120_000);
    expect(parseRetryAfterMs(" 30 ")).toBe(30_000);
  });

  it("parses HTTP-date values relative to the injected clock", () => {
    const now = Date.parse("2026-06-11T00:00:00.000Z");
    expect(parseRetryAfterMs("Thu, 11 Jun 2026 00:00:30 GMT", () => now)).toBe(30_000);
  });

  it("clamps HTTP-date values in the past to zero", () => {
    const now = Date.parse("2026-06-11T00:01:00.000Z");
    expect(parseRetryAfterMs("Thu, 11 Jun 2026 00:00:00 GMT", () => now)).toBe(0);
  });

  it("returns undefined for absent or malformed values", () => {
    expect(parseRetryAfterMs(null)).toBeUndefined();
    expect(parseRetryAfterMs("")).toBeUndefined();
    expect(parseRetryAfterMs("   ")).toBeUndefined();
    expect(parseRetryAfterMs("soon")).toBeUndefined();
    expect(parseRetryAfterMs("-5")).toBeUndefined();
    expect(parseRetryAfterMs("1.5.0")).toBeUndefined();
  });
});

describe("mapResponseError rate limiting", () => {
  it("marks 429 responses retryable and captures retryAfterMs", () => {
    const error = mapResponseError(createResponse(429, { "retry-after": "2" }), "/throttled");

    expect(error).toBeInstanceOf(ConnectionError);
    const typed = error as ConnectionError;
    expect(typed.retryable).toBe(true);
    expect(typed.details).toMatchObject({ retryAfterMs: 2000, status: 429 });
    expect(typed.message).toContain("rate limited");
  });

  it("marks 429 responses retryable even without a Retry-After header", () => {
    const error = mapResponseError(createResponse(429), "/throttled") as ConnectionError;

    expect(error.retryable).toBe(true);
    expect(error.details).not.toHaveProperty("retryAfterMs");
  });

  it("captures retryAfterMs on 503 responses", () => {
    const error = mapResponseError(
      createResponse(503, { "retry-after": "10" }),
      "/maintenance",
    ) as ConnectionError;

    expect(error.retryable).toBe(true);
    expect(error.details).toMatchObject({ retryAfterMs: 10_000, status: 503 });
  });

  it("ignores malformed Retry-After headers", () => {
    const error = mapResponseError(
      createResponse(503, { "retry-after": "later" }),
      "/maintenance",
    ) as ConnectionError;

    expect(error.retryable).toBe(true);
    expect(error.details).not.toHaveProperty("retryAfterMs");
  });

  it("keeps body excerpts alongside rate-limit details", () => {
    const error = mapResponseError(
      createResponse(429, { "retry-after": "1" }),
      "/throttled",
      "slow down",
    ) as ConnectionError;

    expect(error.details).toMatchObject({ body: "slow down", retryAfterMs: 1000 });
  });
});
