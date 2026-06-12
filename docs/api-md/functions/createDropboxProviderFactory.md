[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createDropboxProviderFactory

# Function: createDropboxProviderFactory()

```ts
function createDropboxProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/DropboxProvider.ts:128](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/cloud/DropboxProvider.ts#L128)

Creates a Dropbox provider factory.

The bearer token is resolved per-connection from `profile.password`. The
`profile.host` field is unused; Dropbox connections are identified solely by
their token. Large uploads stream through chunked upload sessions
(`upload_session/start` + `append_v2` + `finish`); payloads at or below the
threshold use single-shot `/2/files/upload`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DropboxProviderOptions`](../interfaces/DropboxProviderOptions.md) | Optional API base URL overrides, upload-session tuning, and fetch implementation. |

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
