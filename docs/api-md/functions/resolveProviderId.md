[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveProviderId

# Function: resolveProviderId()

```ts
function resolveProviderId(selection): ProviderId | undefined;
```

Defined in: [src/core/ProviderId.ts:59](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/core/ProviderId.ts#L59)

Resolves the provider id from a profile, preferring the new `provider` field.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selection` | [`ProviderSelection`](../interfaces/ProviderSelection.md) | Profile-like object containing provider and/or protocol fields. |

## Returns

[`ProviderId`](../type-aliases/ProviderId.md) \| `undefined`

The selected provider id, or `undefined` when neither field is present.
