[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncConflictPolicy

# Type Alias: SyncConflictPolicy

```ts
type SyncConflictPolicy = "overwrite" | "prefer-destination" | "skip" | "error";
```

Defined in: [src/sync/createSyncPlan.ts:29](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/createSyncPlan.ts#L29)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries flagged as modified on both sides.
