[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueue

# Class: TransferQueue

Defined in: [src/transfers/TransferQueue.ts:139](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L139)

Minimal transfer queue with concurrency, pause/resume, cancellation, and drain summaries.

Wrap a [TransferEngine](TransferEngine.md) with a queue when you need to run many transfers
concurrently with bounded parallelism, observe per-job progress, or drive
a UI from a single source of truth. Items are FIFO; failures and successes
are surfaced via observers and in the final [TransferQueueSummary](../interfaces/TransferQueueSummary.md).

## Example

```ts
import {
  TransferQueue,
  createProviderTransferExecutor,
} from "@zero-transfer/sdk";

const queue = new TransferQueue({
  concurrency: 4,
  executor: createProviderTransferExecutor({ client }),
  onProgress: (e) => console.log(`${e.jobId}: ${e.bytesTransferred}`),
  onError: (item, err) => console.error(`${item.job.id} failed`, err),
});

for (const file of files) {
  queue.enqueue({
    id: file.name,
    operation: "upload",
    source: { profile: localProfile, path: file.path },
    destination: { profile: s3Profile, path: `/lake/${file.name}` },
  });
}

const summary = await queue.drain();
console.log(`Completed ${summary.completed} / ${summary.total}`);
```

## Constructors

### Constructor

```ts
new TransferQueue(options?): TransferQueue;
```

Defined in: [src/transfers/TransferQueue.ts:158](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L158)

Creates a transfer queue.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferQueueOptions`](../interfaces/TransferQueueOptions.md) | Queue engine, concurrency, executor, and observer options. |

#### Returns

`TransferQueue`

## Methods

### add()

```ts
add(job, executor?): TransferQueueItem;
```

Defined in: [src/transfers/TransferQueue.ts:172](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L172)

Adds a transfer job to the queue.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) |
| `executor?` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) |

#### Returns

[`TransferQueueItem`](../interfaces/TransferQueueItem.md)

***

### cancel()

```ts
cancel(jobId): boolean;
```

Defined in: [src/transfers/TransferQueue.ts:212](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L212)

Cancels a queued or running job.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jobId` | `string` |

#### Returns

`boolean`

***

### get()

```ts
get(jobId): TransferQueueItem | undefined;
```

Defined in: [src/transfers/TransferQueue.ts:234](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L234)

Returns a queued item snapshot by id.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jobId` | `string` |

#### Returns

[`TransferQueueItem`](../interfaces/TransferQueueItem.md) \| `undefined`

***

### list()

```ts
list(): TransferQueueItem[];
```

Defined in: [src/transfers/TransferQueue.ts:240](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L240)

Lists queue item snapshots in insertion order.

#### Returns

[`TransferQueueItem`](../interfaces/TransferQueueItem.md)[]

***

### pause()

```ts
pause(): void;
```

Defined in: [src/transfers/TransferQueue.ts:197](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L197)

Pauses dispatch of new queued jobs. Running jobs are allowed to finish.

#### Returns

`void`

***

### resume()

```ts
resume(): void;
```

Defined in: [src/transfers/TransferQueue.ts:202](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L202)

Resumes dispatch of queued jobs on the next `run()` call.

#### Returns

`void`

***

### run()

```ts
run(options?): Promise<TransferQueueSummary>;
```

Defined in: [src/transfers/TransferQueue.ts:245](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L245)

Drains currently queued jobs until complete, failed, canceled, or paused.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`TransferQueueRunOptions`](../interfaces/TransferQueueRunOptions.md) |

#### Returns

`Promise`\<[`TransferQueueSummary`](../interfaces/TransferQueueSummary.md)\>

***

### setConcurrency()

```ts
setConcurrency(concurrency): void;
```

Defined in: [src/transfers/TransferQueue.ts:207](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L207)

Updates queue concurrency for subsequent drains.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `concurrency` | `number` |

#### Returns

`void`

***

### summarize()

```ts
summarize(): TransferQueueSummary;
```

Defined in: [src/transfers/TransferQueue.ts:254](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/transfers/TransferQueue.ts#L254)

Returns a queue summary without executing more work.

#### Returns

[`TransferQueueSummary`](../interfaces/TransferQueueSummary.md)
