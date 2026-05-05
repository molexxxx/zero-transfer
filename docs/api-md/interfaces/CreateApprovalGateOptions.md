[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateApprovalGateOptions

# Interface: CreateApprovalGateOptions

Defined in: [src/mft/approvals.ts:204](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L204)

Options accepted by [createApprovalGate](../functions/createApprovalGate.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="approvalid"></a> `approvalId` | (`input`) => `string` | Function that derives an approval id from each route invocation. | [src/mft/approvals.ts:210](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L210) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used for `requestedAt`/`resolvedAt`. | [src/mft/approvals.ts:212](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L212) |
| <a id="onrequested"></a> `onRequested?` | (`request`) => `void` | Observer fired when a new approval request is created. | [src/mft/approvals.ts:214](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L214) |
| <a id="registry"></a> `registry` | [`ApprovalRegistry`](../classes/ApprovalRegistry.md) | Registry that holds approval requests. | [src/mft/approvals.ts:206](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L206) |
| <a id="runner"></a> `runner` | [`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md) | Underlying runner that executes the route once approval is granted. | [src/mft/approvals.ts:208](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/approvals.ts#L208) |
