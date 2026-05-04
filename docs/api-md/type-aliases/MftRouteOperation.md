[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteOperation

# Type Alias: MftRouteOperation

```ts
type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;
```

Defined in: [src/mft/MftRoute.ts:31](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/MftRoute.ts#L31)

Transfer operations supported by route executors.
