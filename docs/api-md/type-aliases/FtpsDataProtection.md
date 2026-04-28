[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpsDataProtection

# Type Alias: FtpsDataProtection

```ts
type FtpsDataProtection = "clear" | "private";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:133](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpProvider.ts#L133)

FTPS data-channel protection level requested after TLS negotiation.

`private` sends `PROT P` and wraps passive data sockets in TLS. `clear` sends
`PROT C`, keeping the control channel encrypted while leaving data sockets plain.
