[**ZeroTransfer SDK v0.4.4**](../README.md)

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

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:12](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/classic/ftp/FtpResponseParser.ts#L12)

FTP response status family derived from the first digit of the reply code.
