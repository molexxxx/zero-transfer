[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createGoogleDriveProviderFactory

# Function: createGoogleDriveProviderFactory()

```ts
function createGoogleDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:83](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/cloud/GoogleDriveProvider.ts#L83)

Creates a Google Drive provider factory.

The bearer token is resolved per-connection from `profile.password`
(typically an OAuth 2 access token). `profile.host` is unused.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`GoogleDriveProviderOptions`](../interfaces/GoogleDriveProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
