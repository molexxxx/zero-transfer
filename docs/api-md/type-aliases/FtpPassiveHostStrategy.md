[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpPassiveHostStrategy

# Type Alias: FtpPassiveHostStrategy

```ts
type FtpPassiveHostStrategy = "advertised" | "control";
```

Defined in: [src/providers/classic/ftp/FtpProvider.ts:150](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpProvider.ts#L150)

Host selection strategy for PASV data endpoints.

`control` connects data sockets back to the control connection host, which avoids
broken private or unroutable PASV addresses from NATed servers. `advertised` uses
the host supplied by the server's PASV response for deployments that require it.
