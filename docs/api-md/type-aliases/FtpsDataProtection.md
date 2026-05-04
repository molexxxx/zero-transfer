[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsDataProtection

# Type Alias: FtpsDataProtection

```ts
type FtpsDataProtection = "clear" | "private";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:140](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/classic/ftp/FtpProvider.ts#L140)

FTPS data-channel protection level requested after TLS negotiation.

`private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
`PROT C`, keeping the control channel encrypted while leaving data sockets plain.
