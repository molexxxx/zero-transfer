[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointState

# Type Alias: TransferCheckpointState

```ts
type TransferCheckpointState = 
  | TransferByteOffsetCheckpointState
  | TransferPartsCheckpointState;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:113](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L113)

Union of checkpoint state shapes. Both expose `committedBytes`.
