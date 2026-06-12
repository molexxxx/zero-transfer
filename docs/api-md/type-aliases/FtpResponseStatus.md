[**ZeroTransfer SDK v0.4.8**](../README.md)

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

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:12](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/classic/ftp/FtpResponseParser.ts#L12)

FTP response status family derived from the first digit of the reply code.
