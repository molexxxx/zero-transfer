[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFtpProviderFactory

# Function: createFtpProviderFactory()

```ts
function createFtpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:187](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/providers/classic/ftp/FtpProvider.ts#L187)

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
