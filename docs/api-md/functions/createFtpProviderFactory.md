[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFtpProviderFactory

# Function: createFtpProviderFactory()

```ts
function createFtpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:180](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/providers/classic/ftp/FtpProvider.ts#L180)

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
