[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SyncDeletePolicy

# Type Alias: SyncDeletePolicy

```ts
type SyncDeletePolicy = "never" | "mirror" | "replace-only";
```

Defined in: [src/sync/createSyncPlan.ts:20](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/sync/createSyncPlan.ts#L20)

How [createSyncPlan](../functions/createSyncPlan.md) reacts to entries that exist only on the destination.
