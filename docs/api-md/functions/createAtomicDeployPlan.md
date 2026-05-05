[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createAtomicDeployPlan

# Function: createAtomicDeployPlan()

```ts
function createAtomicDeployPlan(options): AtomicDeployPlan;
```

Defined in: [src/sync/createAtomicDeployPlan.ts:162](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/createAtomicDeployPlan.ts#L162)

Builds an [AtomicDeployPlan](../interfaces/AtomicDeployPlan.md) that stages a release, swaps it live, and prunes old releases.

The plan describes a blue/green-style deploy:
 1. Upload to a timestamped staging directory under `<destination>/.releases/`.
 2. Atomically swap the `current` symlink/rename to point at the new release.
 3. Optionally prune old releases beyond `retain`.

No I/O is performed — the host executes the plan steps. Pair with
[createTransferPlan](createTransferPlan.md) or [createTransferJobsFromPlan](createTransferJobsFromPlan.md) to execute.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateAtomicDeployPlanOptions`](../interfaces/CreateAtomicDeployPlanOptions.md) | Inputs and policies that shape the deploy. |

## Returns

[`AtomicDeployPlan`](../interfaces/AtomicDeployPlan.md)

Structured deploy plan ready for execution by the calling host.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When `retain` is less than `1` or the destination root is empty.

## Example

```ts
import { createAtomicDeployPlan } from "@zero-transfer/sdk";

const plan = createAtomicDeployPlan({
  id: "web-2026-04-28",
  source: { rootPath: "./dist" },
  destination: {
    profile: { host: "web1.example.com", provider: "sftp", username: "deploy" },
    rootPath: "/srv/www",
  },
  retain: 5,
  existingReleases: [
    "/srv/www/.releases/2026-04-21T00-00-00Z",
    "/srv/www/.releases/2026-04-14T00-00-00Z",
  ],
});

console.log(plan.swap);   // staging → current rename
console.log(plan.prune);  // releases scheduled for removal
```
