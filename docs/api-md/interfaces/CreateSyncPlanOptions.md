[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateSyncPlanOptions

# Interface: CreateSyncPlanOptions

Defined in: [src/sync/createSyncPlan.ts:48](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L48)

Options accepted by [createSyncPlan](../functions/createSyncPlan.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="conflictpolicy"></a> `conflictPolicy?` | [`SyncConflictPolicy`](../type-aliases/SyncConflictPolicy.md) | Conflict policy. Defaults to `"overwrite"`. | [src/sync/createSyncPlan.ts:62](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L62) |
| <a id="deletepolicy"></a> `deletePolicy?` | [`SyncDeletePolicy`](../type-aliases/SyncDeletePolicy.md) | Delete policy. Defaults to `"never"`. | [src/sync/createSyncPlan.ts:60](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L60) |
| <a id="destination"></a> `destination` | [`SyncEndpointInput`](SyncEndpointInput.md) | Destination-side endpoint that produced the diff. | [src/sync/createSyncPlan.ts:56](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L56) |
| <a id="diff"></a> `diff` | [`RemoteTreeDiff`](RemoteTreeDiff.md) | Diff produced by [diffRemoteTrees](../functions/diffRemoteTrees.md) or an equivalent source. | [src/sync/createSyncPlan.ts:52](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L52) |
| <a id="direction"></a> `direction?` | [`SyncDirection`](../type-aliases/SyncDirection.md) | Sync direction. Defaults to `"source-to-destination"`. | [src/sync/createSyncPlan.ts:58](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L58) |
| <a id="dryrun"></a> `dryRun?` | `boolean` | Whether the plan is informational only. Defaults to `true`. | [src/sync/createSyncPlan.ts:66](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L66) |
| <a id="id"></a> `id` | `string` | Stable plan identifier. | [src/sync/createSyncPlan.ts:50](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L50) |
| <a id="includedirectoryactions"></a> `includeDirectoryActions?` | `boolean` | Whether to plan upload/download steps for directories. Defaults to `false`. | [src/sync/createSyncPlan.ts:64](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L64) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/sync/createSyncPlan.ts:70](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L70) |
| <a id="now"></a> `now?` | () => `Date` | Clock used for deterministic tests. Defaults to `new Date()`. | [src/sync/createSyncPlan.ts:68](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L68) |
| <a id="source"></a> `source` | [`SyncEndpointInput`](SyncEndpointInput.md) | Source-side endpoint that produced the diff. | [src/sync/createSyncPlan.ts:54](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createSyncPlan.ts#L54) |
