[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpProviderOptions

# Interface: FtpProviderOptions

Defined in: [src/providers/classic/ftp/FtpProvider.ts:152](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpProvider.ts#L152)

Options used to create the classic FTP provider factory.

## Extended by

- [`FtpsProviderOptions`](FtpsProviderOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultport"></a> `defaultPort?` | `number` | Default control port used when a connection profile omits `port`. | [src/providers/classic/ftp/FtpProvider.ts:154](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpProvider.ts#L154) |
| <a id="passivehoststrategy"></a> `passiveHostStrategy?` | [`FtpPassiveHostStrategy`](../type-aliases/FtpPassiveHostStrategy.md) | PASV host selection strategy. Defaults to `control` for NAT-friendly compatibility. | [src/providers/classic/ftp/FtpProvider.ts:156](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpProvider.ts#L156) |
