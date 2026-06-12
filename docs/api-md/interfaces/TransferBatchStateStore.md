[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferBatchStateStore

# Interface: TransferBatchStateStore

Defined in: [src/transfers/resumableBatch.ts:142](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L142)

Persistence contract for batch progress. `clear` is invoked when every
executable step has completed; it must tolerate missing entries.

## Methods

### clear()

```ts
clear(planId): void | Promise<void>;
```

Defined in: [src/transfers/resumableBatch.ts:148](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L148)

Removes progress for a plan id.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `planId` | `string` |

#### Returns

`void` \| `Promise`\<`void`\>

***

### load()

```ts
load(planId): 
  | TransferBatchState
  | Promise<TransferBatchState | undefined>
  | undefined;
```

Defined in: [src/transfers/resumableBatch.ts:144](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L144)

Loads progress for a plan id, or `undefined` when absent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `planId` | `string` |

#### Returns

  \| [`TransferBatchState`](TransferBatchState.md)
  \| `Promise`\<[`TransferBatchState`](TransferBatchState.md) \| `undefined`\>
  \| `undefined`

***

### save()

```ts
save(state): void | Promise<void>;
```

Defined in: [src/transfers/resumableBatch.ts:146](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/resumableBatch.ts#L146)

Persists progress for a plan id.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | [`TransferBatchState`](TransferBatchState.md) |

#### Returns

`void` \| `Promise`\<`void`\>
