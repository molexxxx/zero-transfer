[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAtomicDeployPlan

# Function: createAtomicDeployPlan()

```ts
function createAtomicDeployPlan(options): AtomicDeployPlan;
```

Defined in: [src/sync/createAtomicDeployPlan.ts:132](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/sync/createAtomicDeployPlan.ts#L132)

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
