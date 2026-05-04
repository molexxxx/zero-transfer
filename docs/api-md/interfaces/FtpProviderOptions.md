[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpProviderOptions

# Interface: FtpProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:152](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpProvider.ts#L152)

Options used to create the classic FTP provider factory.

## Extended by

- [`FtpsProviderOptions`](FtpsProviderOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [src/providers/classic/ftp/FtpProvider.ts:154](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpProvider.ts#L154) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [src/providers/classic/ftp/FtpProvider.ts:156](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpProvider.ts#L156) |
