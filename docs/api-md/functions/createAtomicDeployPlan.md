[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAtomicDeployPlan

# Function: createAtomicDeployPlan()

```ts
function createAtomicDeployPlan(options): AtomicDeployPlan;
```

Defined in: [src/sync/createAtomicDeployPlan.ts:132](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/createAtomicDeployPlan.ts#L132)

Builds an [AtomicDeployPlan](../interfaces/AtomicDeployPlan.md) that stages a release, swaps it live, and prunes old releases.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateAtomicDeployPlanOptions`](../interfaces/CreateAtomicDeployPlanOptions.md) | Inputs and policies that shape the deploy. |

## Returns

[`AtomicDeployPlan`](../interfaces/AtomicDeployPlan.md)

Structured deploy plan ready for execution by the calling host.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When `retain` is less than `1` or the destination root is empty.
