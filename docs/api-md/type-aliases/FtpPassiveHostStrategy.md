[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpPassiveHostStrategy

# Type Alias: FtpPassiveHostStrategy

```ts
type FtpPassiveHostStrategy = "advertised" | "control";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:150](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/classic/ftp/FtpProvider.ts#L150)

Host selection strategy for PASV data endpoints.

`control` connects data sockets back to the control connection host, which avoids
broken private or unroutable PASV addresses from NATed servers. `advertised` uses
the host supplied by the server's PASV response for deployments that require it.
