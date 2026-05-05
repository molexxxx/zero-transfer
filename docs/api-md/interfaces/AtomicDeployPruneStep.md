[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AtomicDeployPruneStep

# Interface: AtomicDeployPruneStep

Defined in: [src/sync/createAtomicDeployPlan.ts:49](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createAtomicDeployPlan.ts#L49)

Pruning step describing an old release directory marked for deletion.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="id"></a> `id` | `string` | Stable identifier within the prune list. | [src/sync/createAtomicDeployPlan.ts:51](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createAtomicDeployPlan.ts#L51) |
| <a id="path"></a> `path` | `string` | Absolute release directory path to delete. | [src/sync/createAtomicDeployPlan.ts:53](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createAtomicDeployPlan.ts#L53) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider identifier that owns the path when known. | [src/sync/createAtomicDeployPlan.ts:55](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createAtomicDeployPlan.ts#L55) |
| <a id="reason"></a> `reason` | `string` | Reason the release was selected for pruning. | [src/sync/createAtomicDeployPlan.ts:57](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createAtomicDeployPlan.ts#L57) |
