[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createPooledTransferClient

# Function: createPooledTransferClient()

```ts
function createPooledTransferClient(inner, options?): PooledTransferClient;
```

Defined in: [src/core/ConnectionPool.ts:111](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/ConnectionPool.ts#L111)

Wraps a [TransferClient](../classes/TransferClient.md) with connection pooling.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inner` | [`TransferClient`](../classes/TransferClient.md) | Underlying client used to create real provider sessions. |
| `options` | [`ConnectionPoolOptions`](../interfaces/ConnectionPoolOptions.md) | Pool sizing, eviction, and key-derivation overrides. |

## Returns

[`PooledTransferClient`](../interfaces/PooledTransferClient.md)

A [PooledTransferClient](../interfaces/PooledTransferClient.md) that reuses idle sessions.
