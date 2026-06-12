[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createProviderTransferExecutor

# Function: createProviderTransferExecutor()

```ts
function createProviderTransferExecutor(options): TransferExecutor;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:142](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/createProviderTransferExecutor.ts#L142)

Creates a [TransferExecutor](../type-aliases/TransferExecutor.md) that reads from a source provider and writes to a destination provider.

The returned executor supports single-object `upload`, `download`, and `copy` jobs. Provider sessions must
expose `session.transfers.read()` and `session.transfers.write()`; concrete providers remain responsible for
the actual streaming implementation.

When [ProviderTransferExecutorOptions.resume](../interfaces/ProviderTransferExecutorOptions.md#resume) is configured the
executor checkpoints progress against the supplied store and resumes
interrupted transfers: the source is fingerprinted (size/mtime/etag) and a
stored checkpoint is honored only when the fingerprint still matches and the
destination passes a size sanity check. Engine retries resume in-process for
free, and a fresh process resumes through the same store. Checkpoints are
cleared on success and invalidated checkpoints trigger best-effort
provider-side cleanup via
[ProviderTransferOperations.discardResumable](../interfaces/ProviderTransferOperations.md#discardresumable).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ProviderTransferExecutorOptions`](../interfaces/ProviderTransferExecutorOptions.md) | Session resolver plus optional throttle and resume configuration. |

## Returns

[`TransferExecutor`](../type-aliases/TransferExecutor.md)

Transfer executor suitable for [TransferEngine.execute](../classes/TransferEngine.md#execute) or [TransferQueue](../classes/TransferQueue.md).
