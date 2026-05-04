[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
