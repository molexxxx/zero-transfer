[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsDataProtection

# Type Alias: FtpsDataProtection

```ts
type FtpsDataProtection = "clear" | "private";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:141](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/classic/ftp/FtpProvider.ts#L141)

FTPS data-channel protection level requested after TLS negotiation.

`private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
`PROT C`, keeping the control channel encrypted while leaving data sockets plain.
