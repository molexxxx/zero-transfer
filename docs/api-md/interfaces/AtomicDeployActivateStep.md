[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AtomicDeployActivateStep

# Interface: AtomicDeployActivateStep

Defined in: [src/sync/createAtomicDeployPlan.ts:31](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L31)

Kind of activation step described by the plan.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="destructive"></a> `destructive?` | `boolean` | Whether the step replaces or removes data. | [src/sync/createAtomicDeployPlan.ts:43](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L43) |
| <a id="frompath"></a> `fromPath?` | `string` | Source path the operation reads or moves from. | [src/sync/createAtomicDeployPlan.ts:37](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L37) |
| <a id="id"></a> `id` | `string` | Stable identifier within the activation list. | [src/sync/createAtomicDeployPlan.ts:33](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L33) |
| <a id="operation"></a> `operation` | [`AtomicDeployActivateOperation`](../type-aliases/AtomicDeployActivateOperation.md) | Operation the step would perform. | [src/sync/createAtomicDeployPlan.ts:35](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L35) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider identifier that owns the affected paths when known. | [src/sync/createAtomicDeployPlan.ts:41](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L41) |
| <a id="reason"></a> `reason` | `string` | Human-readable description for previews and logs. | [src/sync/createAtomicDeployPlan.ts:45](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L45) |
| <a id="topath"></a> `toPath` | `string` | Destination path the operation writes to. | [src/sync/createAtomicDeployPlan.ts:39](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/createAtomicDeployPlan.ts#L39) |
