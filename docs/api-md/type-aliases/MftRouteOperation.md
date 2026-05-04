[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
