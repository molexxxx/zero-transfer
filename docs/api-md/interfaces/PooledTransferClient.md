[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / PooledTransferClient

# Interface: PooledTransferClient

Defined in: [src/core/ConnectionPool.ts:70](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L70)

Pool-aware [TransferClient](../classes/TransferClient.md) returned by
[createPooledTransferClient](../functions/createPooledTransferClient.md).

## Methods

### connect()

```ts
connect(profile): Promise<TransferSession<unknown>>;
```

Defined in: [src/core/ConnectionPool.ts:72](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L72)

Opens (or leases) a pooled provider session.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `profile` | [`ConnectionProfile`](ConnectionProfile.md) |

#### Returns

`Promise`\<[`TransferSession`](TransferSession.md)\<`unknown`\>\>

***

### drainPool()

```ts
drainPool(): Promise<void>;
```

Defined in: [src/core/ConnectionPool.ts:84](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L84)

Disconnects every idle session and prevents further pooling. After
`drainPool()` resolves, subsequent `connect()` calls still work but
always create fresh sessions (and never return them to the pool).

#### Returns

`Promise`\<`void`\>

***

### getCapabilities()

#### Call Signature

```ts
getCapabilities(): CapabilitySet[];
```

Defined in: [src/core/ConnectionPool.ts:76](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L76)

Returns the registered capability snapshots (delegated).

##### Returns

[`CapabilitySet`](CapabilitySet.md)[]

#### Call Signature

```ts
getCapabilities(providerId): CapabilitySet;
```

Defined in: [src/core/ConnectionPool.ts:78](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L78)

Returns a specific capability snapshot (delegated).

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) |

##### Returns

[`CapabilitySet`](CapabilitySet.md)

***

### hasProvider()

```ts
hasProvider(providerId): boolean;
```

Defined in: [src/core/ConnectionPool.ts:74](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L74)

Inspects the registered providers (delegated to the underlying client).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) |

#### Returns

`boolean`

***

### poolSize()

```ts
poolSize(): number;
```

Defined in: [src/core/ConnectionPool.ts:86](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/core/ConnectionPool.ts#L86)

Returns the number of idle sessions currently held in the pool.

#### Returns

`number`
