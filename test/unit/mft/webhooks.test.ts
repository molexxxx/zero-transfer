import { describe, expect, it, vi } from "vitest";
import {
  ConfigurationError,
  createWebhookAuditLog,
  dispatchWebhook,
  signWebhookPayload,
  type MftAuditEntry,
} from "../../../src/index";

const baseEntry: MftAuditEntry = {
  id: "entry-1",
  recordedAt: new Date("2026-04-28T00:00:00.000Z"),
  routeId: "route-1",
  type: "result",
};

function createFetch(responses: { status: number; ok: boolean }[]): typeof globalThis.fetch {
  let call = 0;
  const fetchImpl: typeof globalThis.fetch = async () => {
    const response = responses[call] ?? { ok: false, status: 500 };
    call += 1;
    await Promise.resolve();
    return response as unknown as Response;
  };
  return vi.fn(fetchImpl);
}

describe("signWebhookPayload", () => {
  it("returns a stable HMAC-SHA256 hex digest", () => {
    const signature = signWebhookPayload("payload", "secret", "2026-04-28T00:00:00.000Z");
    const expected = signWebhookPayload("payload", "secret", "2026-04-28T00:00:00.000Z");

    expect(signature.digest).toBe(expected.digest);
    expect(signature.digest).toMatch(/^[0-9a-f]{64}$/u);
    expect(signature.timestamp).toBe("2026-04-28T00:00:00.000Z");

    const different = signWebhookPayload("payload", "different", "2026-04-28T00:00:00.000Z");
    expect(different.digest).not.toBe(signature.digest);
  });
});

describe("dispatchWebhook", () => {
  const sleep = (): Promise<void> => Promise.resolve();

  it("delivers on first success and signs the payload", async () => {
    const fetchImpl = createFetch([{ ok: true, status: 200 }]);

    const result = await dispatchWebhook({
      fetch: fetchImpl,
      payload: baseEntry,
      sleep,
      target: { secret: "shh", url: "https://hooks.example.com/in" },
    });

    expect(result).toEqual({ attempts: 1, delivered: true, status: 200 });

    const headers = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
    expect(headers["x-mft-signature"]).toMatch(/^[0-9a-f]{64}$/u);
    expect(headers["x-mft-timestamp"]).toMatch(/^\d{4}-\d{2}-\d{2}T/u);
  });

  it("retries failed responses up to maxAttempts", async () => {
    const fetchImpl = createFetch([
      { ok: false, status: 500 },
      { ok: false, status: 502 },
      { ok: true, status: 200 },
    ]);

    const result = await dispatchWebhook({
      fetch: fetchImpl,
      payload: baseEntry,
      retry: { baseDelayMs: 0, maxAttempts: 5, maxDelayMs: 0 },
      sleep,
      target: { url: "https://hooks.example.com/in" },
    });

    expect(result).toEqual({ attempts: 3, delivered: true, status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("returns delivered=false when retries are exhausted", async () => {
    const fetchImpl = createFetch([
      { ok: false, status: 500 },
      { ok: false, status: 500 },
    ]);

    const result = await dispatchWebhook({
      fetch: fetchImpl,
      payload: baseEntry,
      retry: { baseDelayMs: 0, maxAttempts: 2 },
      sleep,
      target: { url: "https://hooks.example.com/in" },
    });

    expect(result.delivered).toBe(false);
    expect(result.attempts).toBe(2);
    expect(result.status).toBe(500);
  });

  it("treats fetch rejections as retryable failures", async () => {
    const fetchImpl: typeof globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ ok: true, status: 204 });

    const result = await dispatchWebhook({
      fetch: fetchImpl,
      payload: baseEntry,
      retry: { baseDelayMs: 0, maxAttempts: 3 },
      sleep,
      target: { url: "https://hooks.example.com/in" },
    });

    expect(result).toEqual({ attempts: 2, delivered: true, status: 204 });
  });

  it("rejects empty target urls", async () => {
    await expect(
      dispatchWebhook({
        payload: baseEntry,
        target: { url: "" },
      }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });
});

describe("createWebhookAuditLog", () => {
  const sleep = (): Promise<void> => Promise.resolve();

  it("delivers entries through the configured target", async () => {
    const fetchImpl = createFetch([{ ok: true, status: 200 }]);
    const log = createWebhookAuditLog({
      fetch: fetchImpl,
      sleep,
      target: { url: "https://hooks.example.com/in" },
    });

    await log.record(baseEntry);
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(await log.list()).toEqual([]);
  });

  it("filters by entry type when target.types is set", async () => {
    const fetchImpl = createFetch([{ ok: true, status: 200 }]);
    const log = createWebhookAuditLog({
      fetch: fetchImpl,
      sleep,
      target: { types: ["result"], url: "https://hooks.example.com/in" },
    });

    await log.record({ ...baseEntry, type: "fire" });
    await log.record({ ...baseEntry, type: "result" });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("invokes onDelivery with the result", async () => {
    const fetchImpl = createFetch([{ ok: false, status: 500 }]);
    const onDelivery =
      vi.fn<(input: { entry: MftAuditEntry; result: { delivered: boolean } }) => void>();

    const log = createWebhookAuditLog({
      fetch: fetchImpl,
      onDelivery,
      retry: { maxAttempts: 1 },
      sleep,
      target: { url: "https://hooks.example.com/in" },
    });

    await log.record(baseEntry);
    expect(onDelivery).toHaveBeenCalledOnce();
    expect(onDelivery.mock.calls[0]?.[0]?.result.delivered).toBe(false);
  });
});
