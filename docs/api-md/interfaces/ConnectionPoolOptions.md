[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionPoolOptions

# Interface: ConnectionPoolOptions

Defined in: [src/core/ConnectionPool.ts:38](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ConnectionPool.ts#L38)

Options for [createPooledTransferClient](../functions/createPooledTransferClient.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="idletimeoutms"></a> `idleTimeoutMs?` | `number` | How long an idle session may sit unused before it is automatically disconnected. Defaults to `60_000` ms. Set to `0` to disable the timer (idle sessions persist until `drainPool()` is called). | [src/core/ConnectionPool.ts:53](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ConnectionPool.ts#L53) |
| <a id="keyof"></a> `keyOf?` | (`profile`) => `string` | Custom pool key derivation. Receives the resolved [ConnectionProfile](ConnectionProfile.md) (after TransferClient validation) and must return a string. Sessions with matching keys are pooled together; never include secrets in the key. The default derives the key from `provider`, `host`, `port`, and `username`. | [src/core/ConnectionPool.ts:63](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ConnectionPool.ts#L63) |
| <a id="maxidleperkey"></a> `maxIdlePerKey?` | `number` | Maximum number of *idle* sessions retained per pool key. Active leases are not counted against this limit — the cap only applies to sessions waiting in the pool. When more than `maxIdlePerKey` sessions become idle simultaneously, the oldest ones are disconnected. Defaults to `4`. | [src/core/ConnectionPool.ts:47](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ConnectionPool.ts#L47) |
