[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createDefaultRetryPolicy

# Function: createDefaultRetryPolicy()

```ts
function createDefaultRetryPolicy(options?): TransferRetryPolicy;
```

Defined in: [src/transfers/createDefaultRetryPolicy.ts:80](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createDefaultRetryPolicy.ts#L80)

Creates the SDK's recommended retry policy for transfer execution.

The policy retries only failures the SDK has marked as safe to retry
(`error.retryable === true` on a [ZeroTransferError](../classes/ZeroTransferError.md)), backing off
exponentially with full jitter: each delay is drawn uniformly from
`[0, min(maxDelayMs, baseDelayMs * 2^(attempt - 1)))`, the schedule that
minimizes contention when many clients retry against the same server.

Server pacing hints are honored: when the failed attempt carries
`details.retryAfterMs` (parsed from an HTTP `Retry-After` header on 429/503
responses by the web-family providers), the next delay is exactly that
value rather than the jittered backoff. A hint that does not fit in the
remaining `maxElapsedMs` budget stops retrying instead of retrying early.

Retries also stop once `maxElapsedMs` has elapsed since execution started,
regardless of how many attempts remain.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DefaultRetryPolicyOptions`](../interfaces/DefaultRetryPolicyOptions.md) | Optional overrides for attempts, delays, and the elapsed budget. |

## Returns

[`TransferRetryPolicy`](../interfaces/TransferRetryPolicy.md)

A [TransferRetryPolicy](../interfaces/TransferRetryPolicy.md) for [TransferEngine.execute](../classes/TransferEngine.md#execute),
  [runRoute](runRoute.md), [TransferQueue](../classes/TransferQueue.md), or client-level defaults.

## Examples

```ts
import { createDefaultRetryPolicy, uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  destination: { path: "/uploads/report.csv", profile },
  localPath: "./out/report.csv",
  retry: createDefaultRetryPolicy(),
});
```

```ts
const retry = createDefaultRetryPolicy({
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
  maxElapsedMs: 15_000,
});
```

## See

[TransferRetryPolicy](../interfaces/TransferRetryPolicy.md) for the underlying hook contract.
