[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebDavProviderFactory

# Function: createWebDavProviderFactory()

```ts
function createWebDavProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/WebDavProvider.ts:119](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/providers/web/WebDavProvider.ts#L119)

Creates a WebDAV provider factory.

Talks to any RFC 4918 server: Nextcloud, ownCloud, sabre/dav, Apache `mod_dav`,
IIS WebDAV, etc. PROPFIND drives directory listings, GET supports byte-range
resume on download, and PUT handles uploads. Server-side `COPY` is exposed via
the capability set. Authentication is per-connection from `profile.password`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`WebDavProviderOptions`](../interfaces/WebDavProviderOptions.md) | Optional id, base path, secure flag, fetch, streaming policy. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createTransferClient, createWebDavProviderFactory, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createWebDavProviderFactory({
    secure: true,
    basePath: "/remote.php/dav/files/alice",
  })],
});

await uploadFile({
  client,
  localPath: "./contracts/2026.pdf",
  destination: {
    path: "/Documents/Contracts/2026.pdf",
    profile: {
      host: "cloud.example.com",
      provider: "webdav",
      username: "alice",
      password: { env: "NEXTCLOUD_APP_PASSWORD" },
    },
  },
});
```
