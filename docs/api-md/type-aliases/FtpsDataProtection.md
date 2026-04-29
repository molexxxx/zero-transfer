[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsDataProtection

# Type Alias: FtpsDataProtection

```ts
type FtpsDataProtection = "clear" | "private";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:133](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpProvider.ts#L133)

FTPS data-channel protection level requested after TLS negotiation.

`private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
`PROT C`, keeping the control channel encrypted while leaving data sockets plain.
