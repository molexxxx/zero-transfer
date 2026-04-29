[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createFtpsProviderFactory

# Function: createFtpsProviderFactory()

```ts
function createFtpsProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:241](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/classic/ftp/FtpProvider.ts#L241)

Creates a provider factory for explicit or implicit FTPS connections.

The factory resolves TLS material from each connection profile, upgrades explicit
sessions with `AUTH TLS`, and applies the configured `PROT` data-channel policy.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`FtpsProviderOptions`](../interfaces/FtpsProviderOptions.md) | Optional provider defaults. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Examples

```ts
import { createFtpsProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({ providers: [createFtpsProviderFactory()] });

const session = await client.connect({
  host: "ftps.example.com",
  provider: "ftps",
  username: "deploy",
  password: { env: "FTPS_PASSWORD" },
  tls: { minVersion: "TLSv1.2" },
});
```

```ts
await client.connect({
  host: "ftps.internal.example",
  provider: "ftps",
  username: "audit",
  tls: {
    ca: { path: "./certs/ca-bundle.pem" },
    cert: { path: "./certs/client.crt" },
    key: { path: "./certs/client.key" },
    // Optional but recommended:
    pinnedFingerprint256: "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
  },
});
```
