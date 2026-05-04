[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeError

# Function: summarizeError()

```ts
function summarizeError(error): {
  code?: string;
  message: string;
  name?: string;
};
```

Defined in: [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/audit.ts#L137)

Serializes an unknown error into the audit-friendly `{ message, name, code }` shape.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `error` | `unknown` | Error value thrown by the route runner. |

## Returns

```ts
{
  code?: string;
  message: string;
  name?: string;
}
```

A plain object suitable for [MftAuditEntry.error](../interfaces/MftAuditEntry.md#error).

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `code?` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/audit.ts#L137) |
| `message` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/audit.ts#L137) |
| `name?` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/audit.ts#L137) |
