[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferEngine

# Class: TransferEngine

Defined in: [src/transfers/TransferEngine.ts:143](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L143)

Executes transfer jobs and produces audit-friendly receipts.

The engine is the lowest-level entry point in the transfer stack: it owns
retry policy, attempt history, abort propagation, progress event
normalization, and receipt construction. Most callers reach the engine
indirectly through [runRoute](../functions/runRoute.md), [uploadFile](../functions/uploadFile.md), [downloadFile](../functions/downloadFile.md),
[copyBetween](../functions/copyBetween.md), or [TransferQueue](TransferQueue.md); instantiate it directly when
you need full control over execution semantics.

## Example

```ts
import {
  TransferEngine,
  createDefaultRetryPolicy,
  type TransferExecutor,
  type TransferJob,
} from "@zero-transfer/sdk";

const engine = new TransferEngine();

const executor: TransferExecutor = async ({ job, signal, onProgress }) => {
  onProgress?.({ jobId: job.id, bytesTransferred: 0 });
  // … perform the bytes here, honoring `signal` …
  return { jobId: job.id, bytesTransferred: 1234, completedAt: new Date() };
};

const job: TransferJob = {
  id: "manual-1",
  operation: "upload",
  source: { profile: localProfile, path: "./data.bin" },
  destination: { profile: s3Profile, path: "/data/data.bin" },
};

const receipt = await engine.execute(job, executor, {
  retry: createDefaultRetryPolicy(),
  timeout: { stallTimeoutMs: 30_000 },
});
console.log(receipt.attempts.length); // 1 on success
```

## Constructors

### Constructor

```ts
new TransferEngine(options?): TransferEngine;
```

Defined in: [src/transfers/TransferEngine.ts:151](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L151)

Creates a transfer engine.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferEngineOptions`](../interfaces/TransferEngineOptions.md) | Optional clock override for deterministic tests. |

#### Returns

`TransferEngine`

## Methods

### execute()

```ts
execute(
   job, 
   executor, 
options?): Promise<TransferReceipt>;
```

Defined in: [src/transfers/TransferEngine.ts:165](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferEngine.ts#L165)

Executes a transfer job through a caller-supplied operation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) | Job metadata used for correlation and receipts. |
| `executor` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) | Concrete transfer operation implementation. |
| `options` | [`TransferEngineExecuteOptions`](../interfaces/TransferEngineExecuteOptions.md) | Optional abort, retry, and progress hooks. |

#### Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt for the completed transfer.

#### Throws

[AbortError](AbortError.md) When execution is cancelled.

#### Throws

[TransferError](TransferError.md) When all attempts fail.
