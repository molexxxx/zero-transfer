[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpPassiveHostStrategy

# Type Alias: FtpPassiveHostStrategy

```ts
type FtpPassiveHostStrategy = "advertised" | "control";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:149](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/classic/ftp/FtpProvider.ts#L149)

Host selection strategy for PASV data endpoints.

`control` connects data sockets back to the control connection host, which avoids
broken private or unroutable PASV addresses from NATed servers. `advertised` uses
the host supplied by the server's PASV response for deployments that require it.
