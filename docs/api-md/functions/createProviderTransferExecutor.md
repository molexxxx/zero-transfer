[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createProviderTransferExecutor

# Function: createProviderTransferExecutor()

```ts
function createProviderTransferExecutor(options): TransferExecutor;
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:65](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/createProviderTransferExecutor.ts#L65)

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
