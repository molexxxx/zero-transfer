[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncConflictPolicy

# Type Alias: SyncConflictPolicy

```ts
type SyncConflictPolicy = "overwrite" | "prefer-destination" | "skip" | "error";
```

Defined in: [src/sync/createSyncPlan.ts:29](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/sync/createSyncPlan.ts#L29)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries flagged as modified on both sides.
