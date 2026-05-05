[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createGoogleDriveProviderFactory

# Function: createGoogleDriveProviderFactory()

```ts
function createGoogleDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/GoogleDriveProvider.ts:111](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/GoogleDriveProvider.ts#L111)

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
