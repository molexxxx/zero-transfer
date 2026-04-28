[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveProviderId

# Function: resolveProviderId()

```ts
function resolveProviderId(selection): ProviderId | undefined;
```

Defined in: [src/core/ProviderId.ts:59](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/core/ProviderId.ts#L59)

Resolves the provider id from a profile, preferring the new `provider` field.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selection` | [`ProviderSelection`](../interfaces/ProviderSelection.md) | Profile-like object containing provider and/or protocol fields. |

## Returns

[`ProviderId`](../type-aliases/ProviderId.md) \| `undefined`

The selected provider id, or `undefined` when neither field is present.
