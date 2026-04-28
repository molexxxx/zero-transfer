[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / TransferExecutor

# Type Alias: TransferExecutor

```ts
type TransferExecutor = (context) => Promise<TransferExecutionResult> | TransferExecutionResult;
```

Defined in: [src/transfers/TransferEngine.ts:42](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/transfers/TransferEngine.ts#L42)

Concrete transfer operation implementation used by the engine.

## Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `context` | [`TransferExecutionContext`](../interfaces/TransferExecutionContext.md) |

## Returns

\| `Promise`\<[`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)\>
\| [`TransferExecutionResult`](../interfaces/TransferExecutionResult.md)
