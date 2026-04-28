[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpProviderOptions

# Interface: FtpProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:145](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpProvider.ts#L145)

Options used to create the classic FTP provider factory.

## Extended by

- [`FtpsProviderOptions`](FtpsProviderOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [src/providers/classic/ftp/FtpProvider.ts:147](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpProvider.ts#L147) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [src/providers/classic/ftp/FtpProvider.ts:149](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpProvider.ts#L149) |
