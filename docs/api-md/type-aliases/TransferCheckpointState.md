[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointState

# Type Alias: TransferCheckpointState

```ts
type TransferCheckpointState = 
  | TransferByteOffsetCheckpointState
  | TransferPartsCheckpointState;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:113](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/TransferCheckpointStore.ts#L113)

Union of checkpoint state shapes. Both expose `committedBytes`.
