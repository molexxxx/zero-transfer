[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createApprovalGate

# Function: createApprovalGate()

```ts
function createApprovalGate(options): ScheduleRouteRunner;
```

Defined in: [src/mft/approvals.ts:227](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/approvals.ts#L227)

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
