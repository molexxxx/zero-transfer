[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createApprovalGate

# Function: createApprovalGate()

```ts
function createApprovalGate(options): ScheduleRouteRunner;
```

Defined in: [src/mft/approvals.ts:227](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/approvals.ts#L227)

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
