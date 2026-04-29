[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createDropboxProviderFactory

# Function: createDropboxProviderFactory()

```ts
function createDropboxProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/DropboxProvider.ts:73](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/cloud/DropboxProvider.ts#L73)

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
