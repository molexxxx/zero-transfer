[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferOperations

# Interface: ProviderTransferOperations

Defined in: [src/providers/ProviderTransferOperations.ts:71](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/ProviderTransferOperations.ts#L71)

Optional read/write surface exposed by provider sessions that support transfer streaming.

## Methods

### read()

```ts
read(request): 
  | ProviderTransferReadResult
| Promise<ProviderTransferReadResult>;
```

Defined in: [src/providers/ProviderTransferOperations.ts:73](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/ProviderTransferOperations.ts#L73)

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

Defined in: [src/providers/ProviderTransferOperations.ts:77](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/ProviderTransferOperations.ts#L77)

Writes readable content to a provider endpoint.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ProviderTransferWriteRequest`](ProviderTransferWriteRequest.md) |

#### Returns

  \| [`TransferExecutionResult`](TransferExecutionResult.md)
  \| `Promise`\<[`TransferExecutionResult`](TransferExecutionResult.md)\>
