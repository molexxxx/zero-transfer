[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferSession

# Interface: TransferSession\<TRaw\>

Defined in: [src/core/TransferSession.ts:14](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L14)

Connected provider session exposed through [TransferClient.connect](../classes/TransferClient.md#connect).

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRaw` | `unknown` |

## Methods

### disconnect()

```ts
disconnect(): Promise<void>;
```

Defined in: [src/core/TransferSession.ts:24](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L24)

Disconnects and releases provider resources.

#### Returns

`Promise`\<`void`\>

***

### raw()?

```ts
optional raw(): TRaw;
```

Defined in: [src/core/TransferSession.ts:26](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L26)

Returns a provider-specific advanced interface when one exists.

#### Returns

`TRaw`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities` | [`CapabilitySet`](CapabilitySet.md) | Provider capabilities available for this connected session. | [src/core/TransferSession.ts:18](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L18) |
| <a id="fs"></a> `fs` | [`RemoteFileSystem`](RemoteFileSystem.md) | Provider-neutral remote file-system operations. | [src/core/TransferSession.ts:20](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L20) |
| <a id="provider"></a> `provider` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider backing this session. | [src/core/TransferSession.ts:16](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L16) |
| <a id="transfers"></a> `transfers?` | [`ProviderTransferOperations`](ProviderTransferOperations.md) | Optional provider-backed transfer read/write operations. | [src/core/TransferSession.ts:22](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/core/TransferSession.ts#L22) |
