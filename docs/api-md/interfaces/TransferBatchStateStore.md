[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferBatchStateStore

# Interface: TransferBatchStateStore

Defined in: src/transfers/resumableBatch.ts:142

Persistence contract for batch progress. `clear` is invoked when every
executable step has completed; it must tolerate missing entries.

## Methods

### clear()

```ts
clear(planId): void | Promise<void>;
```

Defined in: src/transfers/resumableBatch.ts:148

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

Defined in: src/transfers/resumableBatch.ts:144

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

Defined in: src/transfers/resumableBatch.ts:146

Persists progress for a plan id.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | [`TransferBatchState`](TransferBatchState.md) |

#### Returns

`void` \| `Promise`\<`void`\>
