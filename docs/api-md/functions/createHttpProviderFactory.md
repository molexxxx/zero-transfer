[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createHttpProviderFactory

# Function: createHttpProviderFactory()

```ts
function createHttpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/HttpProvider.ts:106](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/HttpProvider.ts#L106)

Creates a provider factory backed by HTTP(S) GET/HEAD.

Read-only by design - use it to fetch artifacts from public URLs, signed
URLs, or HTTP-only artifact servers. Range-based resume is supported when
the server advertises `Accept-Ranges: bytes`. To upload to an HTTP endpoint,
use the WebDAV provider, the S3 provider, or a cloud-specific provider.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`HttpProviderOptions`](../interfaces/HttpProviderOptions.md) | Optional id, base path, secure flag, fetch override. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Examples

```ts
import { createHttpProviderFactory, createTransferClient, downloadFile } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createHttpProviderFactory()] });

await downloadFile({
  client,
  localPath: "./tmp/release.tar.gz",
  source: {
    path: "/releases/v1.0.0/release.tar.gz",
    profile: { host: "downloads.example.com", provider: "http" },
  },
});
```

```ts
await downloadFile({
  client,
  localPath: "./reports/today.json",
  source: {
    path: "/reports/today.json",
    profile: {
      host: "api.example.com",
      provider: "http",
      password: { env: "REPORTS_TOKEN" },
    },
  },
});
```
