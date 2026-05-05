[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferProvider

# Interface: TransferProvider\<TSession\>

Defined in: [src/providers/Provider.ts:12](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/Provider.ts#L12)

Provider implementation that can open transfer sessions.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TSession` *extends* [`TransferSession`](TransferSession.md) | [`TransferSession`](TransferSession.md) |

## Methods

### connect()

```ts
connect(profile): Promise<TSession>;
```

Defined in: [src/providers/Provider.ts:18](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/Provider.ts#L18)

Opens a connected provider session.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `profile` | [`ConnectionProfile`](ConnectionProfile.md) |

#### Returns

`Promise`\<`TSession`\>

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities` | [`CapabilitySet`](CapabilitySet.md) | Capabilities advertised by this provider implementation. | [src/providers/Provider.ts:16](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/Provider.ts#L16) |
| <a id="id"></a> `id` | [`ProviderId`](../type-aliases/ProviderId.md) | Stable provider id. | [src/providers/Provider.ts:14](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/Provider.ts#L14) |
