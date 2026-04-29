[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsProviderOptions

# Interface: FtpsProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:160](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/classic/ftp/FtpProvider.ts#L160)

Options used to create the FTPS provider factory.

## Extends

- [`FtpProviderOptions`](FtpProviderOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="dataprotection"></a> `dataProtection?` | [`FtpsDataProtection`](../type-aliases/FtpsDataProtection.md) | Data channel protection requested through PROT. Defaults to private/encrypted data. | - | [src/providers/classic/ftp/FtpProvider.ts:164](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/classic/ftp/FtpProvider.ts#L164) |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [`FtpProviderOptions`](FtpProviderOptions.md).[`defaultPort`](FtpProviderOptions.md#defaultport) | [src/providers/classic/ftp/FtpProvider.ts:154](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/classic/ftp/FtpProvider.ts#L154) |
| <a id="mode"></a> `mode?` | [`FtpsMode`](../type-aliases/FtpsMode.md) | TLS mode used for the control connection. Defaults to explicit FTPS on port 21. | - | [src/providers/classic/ftp/FtpProvider.ts:162](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/classic/ftp/FtpProvider.ts#L162) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [`FtpProviderOptions`](FtpProviderOptions.md).[`passiveHostStrategy`](FtpProviderOptions.md#passivehoststrategy) | [src/providers/classic/ftp/FtpProvider.ts:156](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/classic/ftp/FtpProvider.ts#L156) |
