/**
 * Webhook delivery primitives for MFT events.
 *
 * Webhooks send {@link MftAuditEntry} payloads to an external endpoint over
 * HTTP. Each delivery is signed with HMAC-SHA256 when the target supplies a
 * secret so consumers can verify authenticity. Retries are bounded and
 * exponential. The {@link createWebhookAuditLog} adapter wraps a webhook
 * target as an {@link MftAuditLog}, which lets schedulers fan their lifecycle
 * events out to webhooks alongside other logs via {@link composeAuditLogs}.
 *
 * @module mft/webhooks
 */
import { createHmac } from "node:crypto";

import { ConfigurationError } from "../errors/ZeroTransferError";
import type { MftAuditEntry, MftAuditLog } from "./audit";

/** Webhook destination. */
export interface WebhookTarget {
  /** Absolute HTTP(S) URL that receives `POST` deliveries. */
  url: string;
  /** Additional headers merged into every request. */
  headers?: Record<string, string>;
  /** Shared secret used to compute the HMAC signature header. */
  secret?: string;
  /** Audit entry types to deliver. Defaults to all types. */
  types?: readonly MftAuditEntry["type"][];
}

/** Retry policy for webhook deliveries. */
export interface WebhookRetryPolicy {
  /** Maximum number of attempts including the initial request. Defaults to 3. */
  maxAttempts?: number;
  /** Base delay in milliseconds. Defaults to 250. */
  baseDelayMs?: number;
  /** Maximum delay in milliseconds. Defaults to 5000. */
  maxDelayMs?: number;
}

/** Options accepted by {@link dispatchWebhook}. */
export interface DispatchWebhookOptions {
  /** Webhook destination. */
  target: WebhookTarget;
  /** Audit entry payload to deliver. */
  payload: MftAuditEntry;
  /** Optional fetch implementation. Defaults to the global `fetch`. */
  fetch?: typeof globalThis.fetch;
  /** Retry policy override. */
  retry?: WebhookRetryPolicy;
  /** Abort signal forwarded to fetch. */
  signal?: AbortSignal;
  /** Sleep used between retries. Defaults to `setTimeout`. */
  sleep?: (delayMs: number) => Promise<void>;
}

/** Result returned by {@link dispatchWebhook}. */
export interface DispatchWebhookResult {
  /** Whether the delivery succeeded. */
  delivered: boolean;
  /** HTTP status of the final attempt. */
  status: number;
  /** Number of attempts performed. */
  attempts: number;
}

/** Signature payload produced by {@link signWebhookPayload}. */
export interface WebhookSignature {
  /** Hex-encoded HMAC-SHA256 digest. */
  digest: string;
  /** ISO-8601 timestamp included in the signed prefix. */
  timestamp: string;
}

/**
 * Computes the HMAC-SHA256 signature for a webhook payload.
 *
 * @param payload - Raw JSON string of the webhook body.
 * @param secret - Shared secret.
 * @param timestamp - Optional fixed timestamp. Defaults to `new Date().toISOString()`.
 * @returns The signature parts that should be included on the request.
 */
export function signWebhookPayload(
  payload: string,
  secret: string,
  timestamp: string = new Date().toISOString(),
): WebhookSignature {
  const mac = createHmac("sha256", secret);
  mac.update(`${timestamp}.${payload}`);
  return { digest: mac.digest("hex"), timestamp };
}

/**
 * Dispatches a single webhook payload with bounded retries.
 *
 * @param options - Target, payload, fetch impl, retry policy, abort signal.
 * @returns The delivery outcome.
 */
export async function dispatchWebhook(
  options: DispatchWebhookOptions,
): Promise<DispatchWebhookResult> {
  validateTarget(options.target);

  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  const retry = normalizeRetry(options.retry);
  const sleep = options.sleep ?? defaultSleep;
  const body = JSON.stringify(options.payload);

  let attempt = 0;
  let lastStatus = 0;

  while (attempt < retry.maxAttempts) {
    attempt += 1;

    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...options.target.headers,
    };

    if (options.target.secret !== undefined) {
      const signature = signWebhookPayload(body, options.target.secret);
      headers["x-mft-signature"] = signature.digest;
      headers["x-mft-timestamp"] = signature.timestamp;
    }

    const init: RequestInit = { body, headers, method: "POST" };
    if (options.signal !== undefined) init.signal = options.signal;

    try {
      const response = await fetchImpl(options.target.url, init);
      lastStatus = response.status;
      if (response.ok) return { attempts: attempt, delivered: true, status: response.status };
    } catch {
      lastStatus = 0;
    }

    if (attempt < retry.maxAttempts) {
      await sleep(computeDelayMs(retry, attempt));
    }
  }

  return { attempts: attempt, delivered: false, status: lastStatus };
}

/** Options accepted by {@link createWebhookAuditLog}. */
export interface CreateWebhookAuditLogOptions {
  /** Webhook destination. */
  target: WebhookTarget;
  /** Optional fetch implementation. */
  fetch?: typeof globalThis.fetch;
  /** Retry policy override. */
  retry?: WebhookRetryPolicy;
  /** Sleep used between retries. */
  sleep?: (delayMs: number) => Promise<void>;
  /** Observer fired for every delivery attempt outcome. */
  onDelivery?: (input: { entry: MftAuditEntry; result: DispatchWebhookResult }) => void;
}

/**
 * Wraps a webhook target as an {@link MftAuditLog}.
 *
 * Entries whose `type` is not in `target.types` are silently dropped. `list()`
 * always returns an empty array because webhook deliveries are not buffered.
 *
 * @param options - Webhook target plus optional retry/observer hooks.
 * @returns An audit log that delivers each `record` call to the webhook.
 */
export function createWebhookAuditLog(options: CreateWebhookAuditLogOptions): MftAuditLog {
  return {
    list: () => Promise.resolve([]),
    record: async (entry) => {
      if (options.target.types !== undefined && !options.target.types.includes(entry.type)) {
        return;
      }

      const dispatchOptions: DispatchWebhookOptions = { payload: entry, target: options.target };
      if (options.fetch !== undefined) dispatchOptions.fetch = options.fetch;
      if (options.retry !== undefined) dispatchOptions.retry = options.retry;
      if (options.sleep !== undefined) dispatchOptions.sleep = options.sleep;

      const result = await dispatchWebhook(dispatchOptions);
      options.onDelivery?.({ entry, result });
    },
  };
}

function validateTarget(target: WebhookTarget): void {
  if (target.url.length === 0) {
    throw new ConfigurationError({
      message: "Webhook target url must be a non-empty string",
      retryable: false,
    });
  }
}

interface NormalizedRetryPolicy {
  baseDelayMs: number;
  maxAttempts: number;
  maxDelayMs: number;
}

function normalizeRetry(retry: WebhookRetryPolicy | undefined): NormalizedRetryPolicy {
  return {
    baseDelayMs: retry?.baseDelayMs ?? 250,
    maxAttempts: retry?.maxAttempts ?? 3,
    maxDelayMs: retry?.maxDelayMs ?? 5_000,
  };
}

function computeDelayMs(retry: NormalizedRetryPolicy, attempt: number): number {
  const delay = retry.baseDelayMs * 2 ** (attempt - 1);
  return Math.min(delay, retry.maxDelayMs);
}

function defaultSleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
