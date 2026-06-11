[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpProviderOptions

# Interface: FtpProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:153](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/classic/ftp/FtpProvider.ts#L153)

Options used to create the classic FTP provider factory.

## Extended by

- [`FtpsProviderOptions`](FtpsProviderOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [src/providers/classic/ftp/FtpProvider.ts:155](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/classic/ftp/FtpProvider.ts#L155) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [src/providers/classic/ftp/FtpProvider.ts:157](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/classic/ftp/FtpProvider.ts#L157) |
