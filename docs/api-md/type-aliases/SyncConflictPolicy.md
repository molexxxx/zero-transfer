[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncConflictPolicy

# Type Alias: SyncConflictPolicy

```ts
type SyncConflictPolicy = "overwrite" | "prefer-destination" | "skip" | "error";
```

Defined in: [src/sync/createSyncPlan.ts:29](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createSyncPlan.ts#L29)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries flagged as modified on both sides.
