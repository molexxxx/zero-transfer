[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftAuditEntry

# Interface: MftAuditEntry

Defined in: [src/mft/audit.ts:19](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L19)

Audit record emitted by route execution.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | \{ `code?`: `string`; `message`: `string`; `name?`: `string`; \} | Serialized error details for `error` entries. | [src/mft/audit.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L33) |
| `error.code?` | `string` | - | [src/mft/audit.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L33) |
| `error.message` | `string` | - | [src/mft/audit.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L33) |
| `error.name?` | `string` | - | [src/mft/audit.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L33) |
| <a id="id"></a> `id` | `string` | Stable record id. | [src/mft/audit.ts:21](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L21) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics. | [src/mft/audit.ts:35](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L35) |
| <a id="receipt"></a> `receipt?` | `Readonly`\<[`TransferReceipt`](TransferReceipt.md)\> | Frozen receipt for `result` entries. | [src/mft/audit.ts:31](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L31) |
| <a id="recordedat"></a> `recordedAt` | `Date` | Wall-clock time at which the entry was created. | [src/mft/audit.ts:23](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L23) |
| <a id="routeid"></a> `routeId` | `string` | Route id correlated with the entry. | [src/mft/audit.ts:27](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L27) |
| <a id="scheduleid"></a> `scheduleId?` | `string` | Schedule id when the event originated from a scheduled fire. | [src/mft/audit.ts:29](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L29) |
| <a id="type"></a> `type` | [`MftAuditEntryType`](../type-aliases/MftAuditEntryType.md) | Event type discriminator. | [src/mft/audit.ts:25](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/audit.ts#L25) |
