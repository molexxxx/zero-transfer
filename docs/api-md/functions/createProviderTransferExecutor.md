[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createProviderTransferExecutor

# Function: createProviderTransferExecutor()

```ts
function createProviderTransferExecutor(options): TransferExecutor;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:65](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/createProviderTransferExecutor.ts#L65)

Creates a [TransferExecutor](../type-aliases/TransferExecutor.md) that reads from a source provider and writes to a destination provider.

The returned executor supports single-object `upload`, `download`, and `copy` jobs. Provider sessions must
expose `session.transfers.read()` and `session.transfers.write()`; concrete providers remain responsible for
the actual streaming implementation.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ProviderTransferExecutorOptions`](../interfaces/ProviderTransferExecutorOptions.md) | Session resolver used for source and destination endpoints. |

## Returns

[`TransferExecutor`](../type-aliases/TransferExecutor.md)

Transfer executor suitable for [TransferEngine.execute](../classes/TransferEngine.md#execute) or [TransferQueue](../classes/TransferQueue.md).
