[**ZeroTransfer SDK v0.3.1**](../README.md)

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

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:12](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpResponseParser.ts#L12)

FTP response status family derived from the first digit of the reply code.
