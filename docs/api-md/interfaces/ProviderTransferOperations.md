[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferOperations

# Interface: ProviderTransferOperations

Defined in: [src/providers/ProviderTransferOperations.ts:99](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/ProviderTransferOperations.ts#L99)

Optional read/write surface exposed by provider sessions that support transfer streaming.

## Methods

### discardResumable()?

```ts
optional discardResumable(request): void | Promise<void>;
```

Defined in: [src/providers/ProviderTransferOperations.ts:113](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/ProviderTransferOperations.ts#L113)

Discards provider-side resumable state referenced by an invalidated
checkpoint (for example aborting an orphaned S3 multipart upload so its
parts stop accruing storage). Best-effort: callers ignore failures.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ProviderTransferDiscardRequest`](ProviderTransferDiscardRequest.md) |

#### Returns

`void` \| `Promise`\<`void`\>

***

### read()

```ts
read(request): 
  | ProviderTransferReadResult
| Promise<ProviderTransferReadResult>;
```

Defined in: [src/providers/ProviderTransferOperations.ts:101](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/ProviderTransferOperations.ts#L101)

Opens readable content for a provider endpoint.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ProviderTransferReadRequest`](ProviderTransferReadRequest.md) |

#### Returns

  \| [`ProviderTransferReadResult`](ProviderTransferReadResult.md)
  \| `Promise`\<[`ProviderTransferReadResult`](ProviderTransferReadResult.md)\>

***

### write()

```ts
write(request): 
  | TransferExecutionResult
| Promise<TransferExecutionResult>;
```

Defined in: [src/providers/ProviderTransferOperations.ts:105](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/ProviderTransferOperations.ts#L105)

Writes readable content to a provider endpoint.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ProviderTransferWriteRequest`](ProviderTransferWriteRequest.md) |

#### Returns

  \| [`TransferExecutionResult`](TransferExecutionResult.md)
  \| `Promise`\<[`TransferExecutionResult`](TransferExecutionResult.md)\>
