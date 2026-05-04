---
title: Errors & diagnostics
description: ZeroTransferError taxonomy, structured details, and the diagnostics helpers.
---

## Every error is a `ZeroTransferError`

All SDK errors derive from [`ZeroTransferError`](../../api/classes/zerotransfererror/). They carry:

| Field       | Type                    | Notes                                                      |
| ----------- | ----------------------- | ---------------------------------------------------------- |
| `name`      | `string`                | Always `"ZeroTransferError"`.                              |
| `code`      | `ZeroTransferErrorCode` | Stable, machine-readable category (see below).             |
| `message`   | `string`                | Human-readable, redaction-safe.                            |
| `details`   | `object \| undefined`   | Structured context (provider, host, path, byte counts, …). |
| `cause`     | `Error \| undefined`    | The wrapped underlying error, when one exists.             |
| `retryable` | `boolean`               | Hint for transfer queues — defaults sensibly per code.     |

### Common codes

- `"connection-failed"` — could not establish the underlying transport.
- `"auth-failed"` — credentials rejected.
- `"host-key-mismatch"` — pinned SSH host key didn't match.
- `"tls-cert-mismatch"` — pinned TLS fingerprint or CA validation failed.
- `"not-found"` — remote path missing.
- `"permission-denied"` — server returned 403 / 550.
- `"capability-unsupported"` — operation isn't available on this provider.
- `"checksum-mismatch"` — verified hash didn't match expected.
- `"aborted"` — caller-initiated cancellation via `AbortSignal`.
- `"timeout"` — operation deadline exceeded.
- `"protocol-error"` — server replied with malformed / unexpected data.
- `"internal"` — bug or invariant violation in the SDK itself.

The full enum lives in [`ZeroTransferErrorCode`](../../api/type-aliases/zerotransfererrorcode/).

### Pattern: branch on `code`

```ts
import { ZeroTransferError } from "@zero-transfer/sdk";

try {
  await uploadFile({ ... });
} catch (err) {
  if (err instanceof ZeroTransferError) {
    if (err.code === "host-key-mismatch") {
      // refuse to fall back, alert security
      throw err;
    }
    if (err.retryable) {
      return scheduleRetry(err);
    }
  }
  throw err;
}
```

## Connection diagnostics

[`runConnectionDiagnostics`](../../api/functions/runconnectiondiagnostics/) probes a profile and returns a structured report (DNS, TCP, TLS handshake, auth, capability advertisement). Pair it with [`summarizeClientDiagnostics`](../../api/functions/summarizeclientdiagnostics/) for an at-a-glance view of every pooled session.

```ts
import { runConnectionDiagnostics, summarizeClientDiagnostics } from "@zero-transfer/sdk";

const report = await runConnectionDiagnostics({ client, profile });
console.log(report);

console.table(summarizeClientDiagnostics(client));
```

Both helpers respect profile redaction, so reports are safe to log or attach to support tickets.

See [`examples/diagnose-connection.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/diagnose-connection.ts) for an end-to-end run.
