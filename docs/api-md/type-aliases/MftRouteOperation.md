[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
