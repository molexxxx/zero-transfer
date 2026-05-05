[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderTransferOperations

# Interface: ProviderTransferOperations

Defined in: [src/providers/ProviderTransferOperations.ts:71](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L71)

Optional read/write surface exposed by provider sessions that support transfer streaming.

## Methods

### read()

```ts
read(request): 
  | ProviderTransferReadResult
| Promise<ProviderTransferReadResult>;
```

Defined in: [src/providers/ProviderTransferOperations.ts:73](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L73)

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

Defined in: [src/providers/ProviderTransferOperations.ts:77](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/ProviderTransferOperations.ts#L77)

Writes readable content to a provider endpoint.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | [`ProviderTransferWriteRequest`](ProviderTransferWriteRequest.md) |

#### Returns

  \| [`TransferExecutionResult`](TransferExecutionResult.md)
  \| `Promise`\<[`TransferExecutionResult`](TransferExecutionResult.md)\>
