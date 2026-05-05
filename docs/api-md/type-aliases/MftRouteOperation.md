[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
