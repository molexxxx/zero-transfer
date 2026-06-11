/**
 * @file Retry, timeout, and stall-detection configuration.
 *
 * Demonstrates the production resilience controls: the exponential-backoff
 * retry policy (`createDefaultRetryPolicy` - full jitter, `Retry-After`
 * hints, total elapsed budget), the two timeout scopes on
 * `TransferTimeoutPolicy` (job-wide deadline vs per-attempt deadline + stall
 * watchdog), client-wide defaults via `createTransferClient({ defaults })`,
 * the per-attempt history on the returned `TransferReceipt`, and
 * redaction-safe error logging. Runs entirely offline against the in-memory
 * provider.
 */
import {
  copyBetween,
  createDefaultRetryPolicy,
  createMemoryProviderFactory,
  createTransferClient,
  redactErrorForLogging,
  type ConnectionProfile,
} from "@zero-transfer/core";

// Client-wide defaults: every helper call (uploadFile, downloadFile,
// copyBetween, runRoute, TransferQueue via its `client` option) inherits
// these unless the call site overrides them.
const client = createTransferClient({
  defaults: {
    retry: createDefaultRetryPolicy(),
    timeout: { stallTimeoutMs: 30_000 },
  },
  providers: [
    createMemoryProviderFactory({
      entries: [
        { content: "id,total\n1,42\n", path: "/source/report.csv", type: "file" },
        { path: "/destination", type: "directory" },
      ],
    }),
  ],
});

const memory: ConnectionProfile = { host: "memory", provider: "memory" };

try {
  // Per-call options win over the client defaults. Job scope (`timeoutMs`)
  // caps the whole execution including retries and fails immediately when it
  // fires; attempt scope (`attemptTimeoutMs`, `stallTimeoutMs`) aborts only
  // the active attempt and feeds the failure back into the retry policy.
  const receipt = await copyBetween({
    client,
    destination: { path: "/destination/report.csv", profile: memory },
    retry: createDefaultRetryPolicy({ maxAttempts: 5, maxElapsedMs: 600_000 }),
    source: { path: "/source/report.csv", profile: memory },
    timeout: { attemptTimeoutMs: 120_000, stallTimeoutMs: 15_000, timeoutMs: 600_000 },
  });

  // The receipt records every attempt, including the error that ended each
  // failed one - "attempt 1 stalled, attempt 2 succeeded" needs no extra
  // instrumentation.
  console.log(
    `Transferred ${receipt.bytesTransferred} bytes in ${receipt.attempts.length} attempt(s).`,
  );
  for (const attempt of receipt.attempts) {
    const outcome = attempt.error ? `failed: ${attempt.error.message}` : "succeeded";
    console.log(`  attempt ${attempt.attempt} (${attempt.durationMs}ms): ${outcome}`);
  }
} catch (error) {
  // Redaction-safe logging: converts anything thrown into a JSON-safe record
  // with credentials, signed URLs, and raw protocol commands stripped.
  console.error("Transfer failed:", redactErrorForLogging(error));
  process.exitCode = 1;
}
