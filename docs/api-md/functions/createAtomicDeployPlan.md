[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAtomicDeployPlan

# Function: createAtomicDeployPlan()

```ts
function createAtomicDeployPlan(options): AtomicDeployPlan;
```

Defined in: [src/sync/createAtomicDeployPlan.ts:132](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createAtomicDeployPlan.ts#L132)

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
