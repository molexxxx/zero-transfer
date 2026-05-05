[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createApprovalGate

# Function: createApprovalGate()

```ts
function createApprovalGate(options): ScheduleRouteRunner;
```

Defined in: [src/mft/approvals.ts:250](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/approvals.ts#L250)

Wraps a route runner with an approval gate.

The returned runner creates an approval request, waits for resolution, and
dispatches the underlying runner only when the request is approved. Rejection
surfaces an [ApprovalRejectedError](../classes/ApprovalRejectedError.md). Pair with [MftScheduler](../classes/MftScheduler.md) to
implement two-person rules and human-in-the-loop release flows.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateApprovalGateOptions`](../interfaces/CreateApprovalGateOptions.md) | Registry, downstream runner, approval-id derivation, hooks. |

## Returns

[`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md)

A [ScheduleRouteRunner](../type-aliases/ScheduleRouteRunner.md) that gates execution behind approval.

## Example

```ts
import {
  ApprovalRegistry,
  createApprovalGate,
  runRoute,
} from "@zero-transfer/sdk";

const approvals = new ApprovalRegistry();

const gatedRunner = createApprovalGate({
  registry: approvals,
  approvalId: ({ route }) => `release:${route.id}:${Date.now()}`,
  onRequested: (req) => notifyOnCallChannel(req),
  runner: ({ client, route, signal }) => runRoute({ client, route, signal }),
});

// Elsewhere, an authorized operator approves or rejects:
approvals.approve(approvalId, { actor: "alice@example.com" });
// approvals.reject(approvalId, { actor: "bob@example.com", reason: "hold release" });
```
