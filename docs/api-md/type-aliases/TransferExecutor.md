[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferExecutor

# Type Alias: TransferExecutor

```ts
type TransferExecutor = (context) => 
  | Promise<TransferExecutionResult>
  | TransferExecutionResult;
```

Defined in: [src/transfers/TransferEngine.ts:42](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/transfers/TransferEngine.ts#L42)

Concrete transfer operation implementation used by the engine.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`TransferExecutionContext`](../interfaces/TransferExecutionContext.md) |

## Returns

  \| `Promise`\<[`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)\>
  \| [`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)
