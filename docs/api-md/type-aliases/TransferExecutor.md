[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferExecutor

# Type Alias: TransferExecutor

```ts
type TransferExecutor = (context) => 
  | Promise<TransferExecutionResult>
  | TransferExecutionResult;
```

Defined in: [src/transfers/TransferEngine.ts:42](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/transfers/TransferEngine.ts#L42)

Concrete transfer operation implementation used by the engine.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`TransferExecutionContext`](../interfaces/TransferExecutionContext.md) |

## Returns

  \| `Promise`\<[`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)\>
  \| [`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)
