---
title: Errors & diagnostics
description: ZeroTransferError taxonomy, structured details, and the diagnostics helpers.
---

## Every error is a `ZeroTransferError`

All SDK errors derive from [`ZeroTransferError`](../../api/classes/zerotransfererror/). They carry:

| Field       | Type                  | Notes                                                      |
| ----------- | --------------------- | ---------------------------------------------------------- |
| `name`      | `string`              | The concrete subclass name (e.g. `"ConnectionError"`).     |
| `code`      | `string`              | Stable, machine-readable category (see below).             |
| `message`   | `string`              | Human-readable, redaction-safe.                            |
| `details`   | `object \| undefined` | Structured context (provider, host, path, byte counts, …). |
| `cause`     | `unknown`             | The wrapped underlying error, when one exists.             |
| `retryable` | `boolean`             | Whether a retry policy may safely retry this failure.      |

Protocol context (`protocol`, `host`, `command`, `path`, `ftpCode`, `sftpCode`) is attached when known, so application code never has to parse error messages.

### Error classes and codes

Each subclass has a stable default code:

| Class                     | Default code                         | Raised when                                              |
| ------------------------- | ------------------------------------ | -------------------------------------------------------- |
| `ConnectionError`         | `ZERO_TRANSFER_CONNECTION_ERROR`     | Transport could not be opened or was lost mid-operation. |
| `AuthenticationError`     | `ZERO_TRANSFER_AUTHENTICATION_ERROR` | Credentials rejected.                                    |
| `AuthorizationError`      | `ZERO_TRANSFER_AUTHORIZATION_ERROR`  | Authenticated but not allowed.                           |
| `PathNotFoundError`       | `ZERO_TRANSFER_PATH_NOT_FOUND`       | Remote path missing.                                     |
| `PathAlreadyExistsError`  | `ZERO_TRANSFER_PATH_ALREADY_EXISTS`  | Destination already exists.                              |
| `PermissionDeniedError`   | `ZERO_TRANSFER_PERMISSION_DENIED`    | Server returned 403 / 550.                               |
| `TimeoutError`            | `ZERO_TRANSFER_TIMEOUT`              | Deadline or stall watchdog fired.                        |
| `AbortError`              | `ZERO_TRANSFER_ABORTED`              | Caller-initiated cancellation via `AbortSignal`.         |
| `ProtocolError`           | `ZERO_TRANSFER_PROTOCOL_ERROR`       | Server replied with malformed or unexpected data.        |
| `ParseError`              | `ZERO_TRANSFER_PARSE_ERROR`          | A server payload could not be parsed safely.             |
| `TransferError`           | `ZERO_TRANSFER_TRANSFER_ERROR`       | A transfer failed after all attempts were exhausted.     |
| `VerificationError`       | `ZERO_TRANSFER_VERIFICATION_ERROR`   | Verified hash didn't match expected.                     |
| `UnsupportedFeatureError` | `ZERO_TRANSFER_UNSUPPORTED_FEATURE`  | Operation isn't available on this provider.              |
| `ConfigurationError`      | `ZERO_TRANSFER_CONFIGURATION_ERROR`  | Invalid options or profile.                              |

### Pattern: branch on class or `code`

```ts
import { AuthenticationError, ZeroTransferError } from "@zero-transfer/sdk";

try {
  await uploadFile({ ... });
} catch (err) {
  if (err instanceof AuthenticationError) {
    // never retry bad credentials, alert security
    throw err;
  }
  if (err instanceof ZeroTransferError && err.retryable) {
    return scheduleRetry(err);
  }
  throw err;
}
```

In practice you rarely branch on `retryable` yourself: [`createDefaultRetryPolicy`](../../api/functions/createdefaultretrypolicy/) already retries only failures the SDK marks retryable, with exponential backoff and jitter. See [Transfers & sync](../../concepts/transfers/) for the full retry/timeout story.

## Safe-to-log serialization

`ZeroTransferError.toJSON()` runs `details` and `command` through secret redaction, so serialized errors never leak credentials, signed URLs, or raw protocol commands (the live `details` property stays unredacted for programmatic consumers). For arbitrary caught values, [`redactErrorForLogging`](../../api/functions/redacterrorforlogging/) converts anything thrown into a JSON-safe, secret-free record, and [`redactUrlForLogging`](../../api/functions/redacturlforlogging/) strips userinfo and query strings (SigV4 signatures, SAS tokens) from URLs before they reach a log line.

```ts
import { redactErrorForLogging } from "@zero-transfer/sdk";

try {
  await uploadFile({ ... });
} catch (err) {
  logger.error("upload failed", redactErrorForLogging(err));
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

See [`examples/diagnose-connection.ts`](https://github.com/molexxxx/zero-transfer/blob/main/examples/diagnose-connection.ts) for an end-to-end run.
