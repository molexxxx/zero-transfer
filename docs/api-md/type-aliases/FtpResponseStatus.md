[**ZeroTransfer SDK v0.1.0**](../README.md)

---

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

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:12](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/classic/ftp/FtpResponseParser.ts#L12)

FTP response status family derived from the first digit of the reply code.
