[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveProviderId

# Function: resolveProviderId()

```ts
function resolveProviderId(selection): ProviderId | undefined;
```

Defined in: [src/core/ProviderId.ts:59](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/core/ProviderId.ts#L59)

Resolves the provider id from a profile, preferring the new `provider` field.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selection` | [`ProviderSelection`](../interfaces/ProviderSelection.md) | Profile-like object containing provider and/or protocol fields. |

## Returns

[`ProviderId`](../type-aliases/ProviderId.md) \| `undefined`

The selected provider id, or `undefined` when neither field is present.
