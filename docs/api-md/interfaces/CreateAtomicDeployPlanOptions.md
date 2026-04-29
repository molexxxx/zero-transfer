[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateAtomicDeployPlanOptions

# Interface: CreateAtomicDeployPlanOptions

Defined in: [src/sync/createAtomicDeployPlan.ts:95](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L95)

Options accepted by [createAtomicDeployPlan](../functions/createAtomicDeployPlan.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="destination"></a> `destination` | [`SyncEndpointInput`](SyncEndpointInput.md) | Live destination endpoint the release activates onto. | [src/sync/createAtomicDeployPlan.ts:103](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L103) |
| <a id="diff"></a> `diff` | [`RemoteTreeDiff`](RemoteTreeDiff.md) | Diff describing source vs. staging contents (typically diffed against an empty staging directory). | [src/sync/createAtomicDeployPlan.ts:99](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L99) |
| <a id="dryrun"></a> `dryRun?` | `boolean` | Whether the plan is informational only. Defaults to `true`. | [src/sync/createAtomicDeployPlan.ts:115](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L115) |
| <a id="existingreleases"></a> `existingReleases?` | `string`[] | Existing release directory paths under the releases root that may be pruned. | [src/sync/createAtomicDeployPlan.ts:113](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L113) |
| <a id="id"></a> `id` | `string` | Stable plan identifier. | [src/sync/createAtomicDeployPlan.ts:97](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L97) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/sync/createAtomicDeployPlan.ts:119](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L119) |
| <a id="now"></a> `now?` | () => `Date` | Clock used for deterministic tests. Defaults to `new Date()`. | [src/sync/createAtomicDeployPlan.ts:117](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L117) |
| <a id="releaseid"></a> `releaseId?` | `string` | Release identifier. Defaults to a timestamp derived from [now](#now). | [src/sync/createAtomicDeployPlan.ts:107](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L107) |
| <a id="releasesdirectory"></a> `releasesDirectory?` | `string` | Releases directory name under the destination root. Defaults to `".releases"`. | [src/sync/createAtomicDeployPlan.ts:109](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L109) |
| <a id="retain"></a> `retain?` | `number` | Number of releases to retain after the new release, including the new one. Defaults to `3`. | [src/sync/createAtomicDeployPlan.ts:111](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L111) |
| <a id="source"></a> `source` | [`SyncEndpointInput`](SyncEndpointInput.md) | Source-side endpoint feeding the release. | [src/sync/createAtomicDeployPlan.ts:101](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L101) |
| <a id="strategy"></a> `strategy?` | [`AtomicDeployStrategy`](../type-aliases/AtomicDeployStrategy.md) | Activation strategy. Defaults to `"rename"`. | [src/sync/createAtomicDeployPlan.ts:105](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createAtomicDeployPlan.ts#L105) |
