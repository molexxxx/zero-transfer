[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFtpProviderFactory

# Function: createFtpProviderFactory()

```ts
function createFtpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:187](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpProvider.ts#L187)

Creates a provider factory for classic FTP connections.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`FtpProviderOptions`](../interfaces/FtpProviderOptions.md) | Optional provider defaults. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createFtpProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createFtpProviderFactory()] });

const session = await client.connect({
  host: "ftp.example.com",
  provider: "ftp",
  username: "deploy",
  password: { env: "FTP_PASSWORD" },
});
```
