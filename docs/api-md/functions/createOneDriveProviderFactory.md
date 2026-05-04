[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOneDriveProviderFactory

# Function: createOneDriveProviderFactory()

```ts
function createOneDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/OneDriveProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/cloud/OneDriveProvider.ts#L74)

Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph.

The bearer token is resolved per-connection from `profile.password`.
`profile.host` is unused.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`OneDriveProviderOptions`](../interfaces/OneDriveProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
