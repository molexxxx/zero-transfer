[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsMode

# Type Alias: FtpsMode

```ts
type FtpsMode = "explicit" | "implicit";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:125](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpProvider.ts#L125)

FTPS control-channel TLS mode.

`explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
`implicit` starts TLS immediately, typically on port 990.
