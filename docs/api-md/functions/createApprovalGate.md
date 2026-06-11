[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createApprovalGate

# Function: createApprovalGate()

```ts
function createApprovalGate(options): ScheduleRouteRunner;
```

Defined in: [src/mft/approvals.ts:283](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L283)

Wraps a route runner with an approval gate.

The returned runner creates an approval request, waits for resolution, and
dispatches the underlying runner only when the request is approved. Rejection
surfaces an [ApprovalRejectedError](../classes/ApprovalRejectedError.md); an unresolved request that exceeds
`timeoutMs` surfaces an [ApprovalTimeoutError](../classes/ApprovalTimeoutError.md). Pair with
[MftScheduler](../classes/MftScheduler.md) to implement two-person rules and human-in-the-loop
release flows.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateApprovalGateOptions`](../interfaces/CreateApprovalGateOptions.md) | Registry, downstream runner, approval-id derivation, hooks. |

## Returns

[`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md)

A [ScheduleRouteRunner](../type-aliases/ScheduleRouteRunner.md) that gates execution behind approval.

## Throws

[ApprovalTimeoutError](../classes/ApprovalTimeoutError.md) From the returned runner when the
request stays pending longer than `timeoutMs`.

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
