[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncConflictPolicy

# Type Alias: SyncConflictPolicy

```ts
type SyncConflictPolicy = "overwrite" | "prefer-destination" | "skip" | "error";
```

Defined in: [src/sync/createSyncPlan.ts:29](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L29)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries flagged as modified on both sides.
