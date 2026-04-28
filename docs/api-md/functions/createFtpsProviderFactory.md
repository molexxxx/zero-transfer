[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createFtpsProviderFactory

# Function: createFtpsProviderFactory()

```ts
function createFtpsProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:189](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L189)

Creates a provider factory for explicit or implicit FTPS connections.

The factory resolves TLS material from each connection profile, upgrades explicit
sessions with `AUTH TLS`, and applies the configured `PROT` data-channel policy.

## Parameters

| Parameter | Type                                                          | Description                 |
| --------- | ------------------------------------------------------------- | --------------------------- |
| `options` | [`FtpsProviderOptions`](../interfaces/FtpsProviderOptions.md) | Optional provider defaults. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
