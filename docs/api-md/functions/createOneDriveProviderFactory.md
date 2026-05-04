[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOneDriveProviderFactory

# Function: createOneDriveProviderFactory()

```ts
function createOneDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/OneDriveProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/cloud/OneDriveProvider.ts#L74)

Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph.

The bearer token is resolved per-connection from `profile.password`.
`profile.host` is unused.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`OneDriveProviderOptions`](../interfaces/OneDriveProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
