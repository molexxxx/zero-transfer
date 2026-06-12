[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferCheckpointState

# Type Alias: TransferCheckpointState

```ts
type TransferCheckpointState = 
  | TransferByteOffsetCheckpointState
  | TransferPartsCheckpointState;
```

Defined in: src/transfers/TransferCheckpointStore.ts:113

Union of checkpoint state shapes. Both expose `committedBytes`.
