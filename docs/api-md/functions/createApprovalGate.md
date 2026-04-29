[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createApprovalGate

# Function: createApprovalGate()

```ts
function createApprovalGate(options): ScheduleRouteRunner;
```

Defined in: [src/mft/approvals.ts:227](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/approvals.ts#L227)

Wraps a route runner with an approval gate.

The returned runner creates an approval request, waits for resolution, and
dispatches the underlying runner only when the request is approved. Rejection
surfaces an [ApprovalRejectedError](../classes/ApprovalRejectedError.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateApprovalGateOptions`](../interfaces/CreateApprovalGateOptions.md) | Registry, downstream runner, approval-id derivation, hooks. |

## Returns

[`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md)

A [ScheduleRouteRunner](../type-aliases/ScheduleRouteRunner.md) that gates execution behind approval.
