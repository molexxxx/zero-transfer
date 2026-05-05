[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncConflictPolicy

# Type Alias: SyncConflictPolicy

```ts
type SyncConflictPolicy = "overwrite" | "prefer-destination" | "skip" | "error";
```

Defined in: [src/sync/createSyncPlan.ts:29](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/createSyncPlan.ts#L29)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries flagged as modified on both sides.
