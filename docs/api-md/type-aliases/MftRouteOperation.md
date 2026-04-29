[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
