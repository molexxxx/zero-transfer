[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointHandle

# Interface: TransferCheckpointHandle

Defined in: [src/transfers/TransferCheckpointStore.ts:163](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L163)

Live handle a provider uses to checkpoint part-aware progress during a
write.

The transfer executor constructs the handle (binding the store, key, and
source fingerprint) and attaches it to
[ProviderTransferWriteRequest.checkpoint](ProviderTransferWriteRequest.md#checkpoint). Providers that upload in
discrete parts call [save](#save) as the contiguous completed-part prefix
advances and read [state](#state) to pick up prior progress. Clearing on
success is the executor's responsibility - providers only ever record
progress.

## Methods

### clear()

```ts
clear(): Promise<void>;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:172](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L172)

Removes the stored checkpoint (for example when the provider restarts the upload).

#### Returns

`Promise`\<`void`\>

***

### save()

```ts
save(state): Promise<void>;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:170](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L170)

Persists new progress state for this transfer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | [`TransferCheckpointState`](../type-aliases/TransferCheckpointState.md) |

#### Returns

`Promise`\<`void`\>

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="state"></a> `state?` | `readonly` | [`TransferCheckpointState`](../type-aliases/TransferCheckpointState.md) | Validated state loaded for this transfer, when prior progress exists. `undefined` means start fresh (no checkpoint, or it was invalidated). | [src/transfers/TransferCheckpointStore.ts:168](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L168) |
