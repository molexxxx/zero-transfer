[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateApprovalGateOptions

# Interface: CreateApprovalGateOptions

Defined in: [src/mft/approvals.ts:227](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L227)

Options accepted by [createApprovalGate](../functions/createApprovalGate.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="approvalid"></a> `approvalId` | (`input`) => `string` | Function that derives an approval id from each route invocation. | [src/mft/approvals.ts:233](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L233) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used for `requestedAt`/`resolvedAt`. | [src/mft/approvals.ts:235](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L235) |
| <a id="onrequested"></a> `onRequested?` | (`request`) => `void` | Observer fired when a new approval request is created. | [src/mft/approvals.ts:237](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L237) |
| <a id="registry"></a> `registry` | [`ApprovalRegistry`](../classes/ApprovalRegistry.md) | Registry that holds approval requests. | [src/mft/approvals.ts:229](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L229) |
| <a id="runner"></a> `runner` | [`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md) | Underlying runner that executes the route once approval is granted. | [src/mft/approvals.ts:231](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L231) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Maximum time in milliseconds an approval may stay pending. When the window elapses the request is rejected with reason `"timeout"` and the gated run fails with a typed [ApprovalTimeoutError](../classes/ApprovalTimeoutError.md). Unset means wait forever. | [src/mft/approvals.ts:243](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/mft/approvals.ts#L243) |
