[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferQueueExecutorResolver

# Type Alias: TransferQueueExecutorResolver

```ts
type TransferQueueExecutorResolver = (job) => TransferExecutor;
```

Defined in: [src/transfers/TransferQueue.ts:26](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/transfers/TransferQueue.ts#L26)

Resolver used when jobs do not provide an executor at enqueue time.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) |

## Returns

[`TransferExecutor`](TransferExecutor.md)
