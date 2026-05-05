[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpPassiveHostStrategy

# Type Alias: FtpPassiveHostStrategy

```ts
type FtpPassiveHostStrategy = "advertised" | "control";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:149](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/classic/ftp/FtpProvider.ts#L149)

Host selection strategy for PASV data endpoints.

`control` connects data sockets back to the control connection host, which avoids
broken private or unroutable PASV addresses from NATed servers. `advertised` uses
the host supplied by the server's PASV response for deployments that require it.
