[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOneDriveProviderFactory

# Function: createOneDriveProviderFactory()

```ts
function createOneDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/OneDriveProvider.ts:74](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/cloud/OneDriveProvider.ts#L74)

Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph.

The bearer token is resolved per-connection from `profile.password`.
`profile.host` is unused.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`OneDriveProviderOptions`](../interfaces/OneDriveProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
