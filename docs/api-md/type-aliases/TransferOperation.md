[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferOperation

# Type Alias: TransferOperation

```ts
type TransferOperation =
  | "copy"
  | "delete"
  | "download"
  | "move"
  | "sync"
  | "upload"
  | (string & {});
```

Defined in: [src/transfers/TransferJob.ts:9](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L9)

Provider-neutral transfer operation names.
