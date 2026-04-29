[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsMode

# Type Alias: FtpsMode

```ts
type FtpsMode = "explicit" | "implicit";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:125](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpProvider.ts#L125)

FTPS control-channel TLS mode.

`explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
`implicit` starts TLS immediately, typically on port 990.
