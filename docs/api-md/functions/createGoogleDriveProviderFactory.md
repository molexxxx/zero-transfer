[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createGoogleDriveProviderFactory

# Function: createGoogleDriveProviderFactory()

```ts
function createGoogleDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:141](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/cloud/GoogleDriveProvider.ts#L141)

Creates a Google Drive provider factory.

The bearer token is resolved per-connection from `profile.password`
(typically an OAuth 2 access token). `profile.host` is unused. Set
`rootFolderId` to scope the provider to a shared-drive subtree instead
of the authenticated user's My Drive root.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`GoogleDriveProviderOptions`](../interfaces/GoogleDriveProviderOptions.md) | Optional `rootFolderId`, `fetch`, and default headers. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createGoogleDriveProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createGoogleDriveProviderFactory({ rootFolderId: "0AB1cDeFG2HiJk" })],
});

await uploadFile({
  client,
  localPath: "./contracts/2026-Q2.pdf",
  destination: {
    path: "/Contracts/2026-Q2.pdf",
    profile: {
      host: "",
      provider: "google-drive",
      password: { env: "GOOGLE_OAUTH_ACCESS_TOKEN" },
    },
  },
});
```
