[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ApprovalRequest

# Interface: ApprovalRequest

Defined in: [src/mft/approvals.ts:20](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L20)

Approval request record.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="id"></a> `id` | `string` | Stable approval id. | [src/mft/approvals.ts:22](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L22) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/mft/approvals.ts:36](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L36) |
| <a id="reason"></a> `reason?` | `string` | Caller-defined reason recorded with the resolution. | [src/mft/approvals.ts:34](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L34) |
| <a id="requestedat"></a> `requestedAt` | `Date` | Wall-clock time at which the request was created. | [src/mft/approvals.ts:26](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L26) |
| <a id="resolvedat"></a> `resolvedAt?` | `Date` | Wall-clock time at which the status changed. | [src/mft/approvals.ts:30](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L30) |
| <a id="resolvedby"></a> `resolvedBy?` | `string` | Identifier of the principal that resolved the request. | [src/mft/approvals.ts:32](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L32) |
| <a id="routeid"></a> `routeId` | `string` | Route id awaiting approval. | [src/mft/approvals.ts:24](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L24) |
| <a id="status"></a> `status` | [`ApprovalStatus`](../type-aliases/ApprovalStatus.md) | Current status. | [src/mft/approvals.ts:28](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/approvals.ts#L28) |
