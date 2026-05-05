[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createPooledTransferClient

# Function: createPooledTransferClient()

```ts
function createPooledTransferClient(inner, options?): PooledTransferClient;
```

Defined in: [src/core/ConnectionPool.ts:111](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/core/ConnectionPool.ts#L111)

Wraps a [TransferClient](../classes/TransferClient.md) with connection pooling.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inner` | [`TransferClient`](../classes/TransferClient.md) | Underlying client used to create real provider sessions. |
| `options` | [`ConnectionPoolOptions`](../interfaces/ConnectionPoolOptions.md) | Pool sizing, eviction, and key-derivation overrides. |

## Returns

[`PooledTransferClient`](../interfaces/PooledTransferClient.md)

A [PooledTransferClient](../interfaces/PooledTransferClient.md) that reuses idle sessions.
