[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AtomicDeployPlan

# Interface: AtomicDeployPlan

Defined in: [src/sync/createAtomicDeployPlan.ts:61](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L61)

Result returned by [createAtomicDeployPlan](../functions/createAtomicDeployPlan.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="activate"></a> `activate` | [`AtomicDeployActivateStep`](AtomicDeployActivateStep.md)[] | Activation steps that swap staging into the live path. | [src/sync/createAtomicDeployPlan.ts:81](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L81) |
| <a id="backuppath"></a> `backupPath?` | `string` | Optional backup path used by the rename strategy. | [src/sync/createAtomicDeployPlan.ts:77](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L77) |
| <a id="createdat"></a> `createdAt` | `Date` | Time the plan was created. | [src/sync/createAtomicDeployPlan.ts:87](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L87) |
| <a id="id"></a> `id` | `string` | Stable plan identifier. | [src/sync/createAtomicDeployPlan.ts:63](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L63) |
| <a id="livepath"></a> `livePath` | `string` | Live target path the release activates onto. | [src/sync/createAtomicDeployPlan.ts:71](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L71) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/sync/createAtomicDeployPlan.ts:91](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L91) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider identifier for the live destination when known. | [src/sync/createAtomicDeployPlan.ts:69](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L69) |
| <a id="prune"></a> `prune` | [`AtomicDeployPruneStep`](AtomicDeployPruneStep.md)[] | Prune steps that remove older releases beyond [retain](#retain). | [src/sync/createAtomicDeployPlan.ts:83](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L83) |
| <a id="releaseid"></a> `releaseId` | `string` | Release identifier embedded into the staging path. | [src/sync/createAtomicDeployPlan.ts:65](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L65) |
| <a id="releasesroot"></a> `releasesRoot` | `string` | Releases root directory under which staging and prior releases live. | [src/sync/createAtomicDeployPlan.ts:75](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L75) |
| <a id="retain"></a> `retain` | `number` | Number of releases to retain (including the new release). | [src/sync/createAtomicDeployPlan.ts:85](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L85) |
| <a id="stagingpath"></a> `stagingPath` | `string` | Staging directory the upload populates. | [src/sync/createAtomicDeployPlan.ts:73](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L73) |
| <a id="strategy"></a> `strategy` | [`AtomicDeployStrategy`](../type-aliases/AtomicDeployStrategy.md) | Activation strategy chosen for the swap. | [src/sync/createAtomicDeployPlan.ts:67](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L67) |
| <a id="uploadplan"></a> `uploadPlan` | [`TransferPlan`](TransferPlan.md) | Upload plan that populates the staging directory. | [src/sync/createAtomicDeployPlan.ts:79](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L79) |
| <a id="warnings"></a> `warnings` | `string`[] | Non-fatal plan warnings. | [src/sync/createAtomicDeployPlan.ts:89](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/createAtomicDeployPlan.ts#L89) |
