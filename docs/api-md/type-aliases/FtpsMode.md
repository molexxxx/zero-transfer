[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsMode

# Type Alias: FtpsMode

```ts
type FtpsMode = "explicit" | "implicit";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:132](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/providers/classic/ftp/FtpProvider.ts#L132)

FTPS control-channel TLS mode.

`explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
`implicit` starts TLS immediately, typically on port 990.
