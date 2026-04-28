[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / FtpsProviderOptions

# Interface: FtpsProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:153](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L153)

Options used to create the FTPS provider factory.

## Extends

- [`FtpProviderOptions`](FtpProviderOptions.md)

## Properties

| Property                                                | Type                                                                  | Description                                                                         | Inherited from                                                                                                   | Defined in                                                                                                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="dataprotection"></a> `dataProtection?`           | [`FtpsDataProtection`](../type-aliases/FtpsDataProtection.md)         | Data channel protection requested through PROT. Defaults to private/encrypted data. | -                                                                                                                | [src/providers/classic/ftp/FtpProvider.ts:157](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L157) |
| <a id="defaultport"></a> `defaultPort?`                 | `number`                                                              | Default control port used when a connection profile omits `port`.                   | [`FtpProviderOptions`](FtpProviderOptions.md).[`defaultPort`](FtpProviderOptions.md#defaultport)                 | [src/providers/classic/ftp/FtpProvider.ts:147](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L147) |
| <a id="mode"></a> `mode?`                               | [`FtpsMode`](../type-aliases/FtpsMode.md)                             | TLS mode used for the control connection. Defaults to explicit FTPS on port 21.     | -                                                                                                                | [src/providers/classic/ftp/FtpProvider.ts:155](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L155) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [`FtpProviderOptions`](FtpProviderOptions.md).[`passiveHostStrategy`](FtpProviderOptions.md#passivehoststrategy) | [src/providers/classic/ftp/FtpProvider.ts:149](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpProvider.ts#L149) |
