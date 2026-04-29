[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createGoogleDriveProviderFactory

# Function: createGoogleDriveProviderFactory()

```ts
function createGoogleDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:83](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/cloud/GoogleDriveProvider.ts#L83)

Creates a Google Drive provider factory.

The bearer token is resolved per-connection from `profile.password`
(typically an OAuth 2 access token). `profile.host` is unused.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`GoogleDriveProviderOptions`](../interfaces/GoogleDriveProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
