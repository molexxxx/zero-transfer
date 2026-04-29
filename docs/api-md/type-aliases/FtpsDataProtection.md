[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsDataProtection

# Type Alias: FtpsDataProtection

```ts
type FtpsDataProtection = "clear" | "private";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:140](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/providers/classic/ftp/FtpProvider.ts#L140)

FTPS data-channel protection level requested after TLS negotiation.

`private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
`PROT C`, keeping the control channel encrypted while leaving data sockets plain.
