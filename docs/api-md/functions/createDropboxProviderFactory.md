[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createDropboxProviderFactory

# Function: createDropboxProviderFactory()

```ts
function createDropboxProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/DropboxProvider.ts:73](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/cloud/DropboxProvider.ts#L73)

Creates a Dropbox provider factory.

The bearer token is resolved per-connection from `profile.password`. The
`profile.host` field is unused; Dropbox connections are identified solely by
their token.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`DropboxProviderOptions`](../interfaces/DropboxProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
