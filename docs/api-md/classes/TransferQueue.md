[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueue

# Class: TransferQueue

Defined in: [src/transfers/TransferQueue.ts:105](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L105)

Minimal transfer queue with concurrency, pause/resume, cancellation, and drain summaries.

## Constructors

### Constructor

```ts
new TransferQueue(options?): TransferQueue;
```

Defined in: [src/transfers/TransferQueue.ts:124](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L124)

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

Defined in: [src/transfers/TransferQueue.ts:138](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L138)

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

Defined in: [src/transfers/TransferQueue.ts:178](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L178)

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

Defined in: [src/transfers/TransferQueue.ts:200](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L200)

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

Defined in: [src/transfers/TransferQueue.ts:206](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L206)

Lists queue item snapshots in insertion order.

#### Returns

[`TransferQueueItem`](../interfaces/TransferQueueItem.md)[]

***

### pause()

```ts
pause(): void;
```

Defined in: [src/transfers/TransferQueue.ts:163](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L163)

Pauses dispatch of new queued jobs. Running jobs are allowed to finish.

#### Returns

`void`

***

### resume()

```ts
resume(): void;
```

Defined in: [src/transfers/TransferQueue.ts:168](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L168)

Resumes dispatch of queued jobs on the next `run()` call.

#### Returns

`void`

***

### run()

```ts
run(options?): Promise<TransferQueueSummary>;
```

Defined in: [src/transfers/TransferQueue.ts:211](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L211)

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

Defined in: [src/transfers/TransferQueue.ts:173](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L173)

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

Defined in: [src/transfers/TransferQueue.ts:220](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferQueue.ts#L220)

Returns a queue summary without executing more work.

#### Returns

[`TransferQueueSummary`](../interfaces/TransferQueueSummary.md)
