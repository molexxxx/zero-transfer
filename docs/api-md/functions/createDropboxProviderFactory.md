[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createDropboxProviderFactory

# Function: createDropboxProviderFactory()

```ts
function createDropboxProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/DropboxProvider.ts:97](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/DropboxProvider.ts#L97)

Creates a Dropbox provider factory.

The bearer token is resolved per-connection from `profile.password`. The
`profile.host` field is unused; Dropbox connections are identified solely by
their token. Uploads go to `/2/files/upload` (single-shot); resumable upload
sessions are not yet supported.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DropboxProviderOptions`](../interfaces/DropboxProviderOptions.md) | Optional API base URL overrides and fetch implementation. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createDropboxProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createDropboxProviderFactory()] });

await uploadFile({
  client,
  localPath: "./backups/db.dump",
  destination: {
    path: "/Backups/2026-04-28/db.dump",
    profile: {
      host: "",
      provider: "dropbox",
      password: { env: "DROPBOX_ACCESS_TOKEN" },
    },
  },
});
```
