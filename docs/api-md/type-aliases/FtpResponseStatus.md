[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpResponseStatus

# Type Alias: FtpResponseStatus

```ts
type FtpResponseStatus = 
  | "preliminary"
  | "completion"
  | "intermediate"
  | "transientFailure"
  | "permanentFailure";
```

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:12](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/classic/ftp/FtpResponseParser.ts#L12)

FTP response status family derived from the first digit of the reply code.
