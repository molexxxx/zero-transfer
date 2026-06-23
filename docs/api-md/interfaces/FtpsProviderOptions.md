[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsProviderOptions

# Interface: FtpsProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:161](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L161)

Options used to create the FTPS provider factory.

## Extends

- [`FtpProviderOptions`](FtpProviderOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="dataprotection"></a> `dataProtection?` | [`FtpsDataProtection`](../type-aliases/FtpsDataProtection.md) | Data channel protection requested through PROT. Defaults to private/encrypted data. | - | [src/providers/classic/ftp/FtpProvider.ts:165](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L165) |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [`FtpProviderOptions`](FtpProviderOptions.md).[`defaultPort`](FtpProviderOptions.md#defaultport) | [src/providers/classic/ftp/FtpProvider.ts:155](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L155) |
| <a id="mode"></a> `mode?` | [`FtpsMode`](../type-aliases/FtpsMode.md) | TLS mode used for the control connection. Defaults to explicit FTPS on port 21. | - | [src/providers/classic/ftp/FtpProvider.ts:163](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L163) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [`FtpProviderOptions`](FtpProviderOptions.md).[`passiveHostStrategy`](FtpProviderOptions.md#passivehoststrategy) | [src/providers/classic/ftp/FtpProvider.ts:157](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L157) |
