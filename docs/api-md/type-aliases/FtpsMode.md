[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsMode

# Type Alias: FtpsMode

```ts
type FtpsMode = "explicit" | "implicit";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:132](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpProvider.ts#L132)

FTPS control-channel TLS mode.

`explicit` connects on a plain FTP control socket and upgrades with `AUTH TLS`;
`implicit` starts TLS immediately, typically on port 990.
