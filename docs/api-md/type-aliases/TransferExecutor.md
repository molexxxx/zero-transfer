[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferExecutor

# Type Alias: TransferExecutor

```ts
type TransferExecutor = (context) => 
  | Promise<TransferExecutionResult>
  | TransferExecutionResult;
```

Defined in: [src/transfers/TransferEngine.ts:42](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L42)

Concrete transfer operation implementation used by the engine.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`TransferExecutionContext`](../interfaces/TransferExecutionContext.md) |

## Returns

  \| `Promise`\<[`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)\>
  \| [`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)
