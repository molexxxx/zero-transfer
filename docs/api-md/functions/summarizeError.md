[**ZeroTransfer SDK v0.4.6**](../README.md)

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

Defined in: [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/audit.ts#L137)

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
| `code?` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/audit.ts#L137) |
| `message` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/audit.ts#L137) |
| `name?` | `string` | [src/mft/audit.ts:137](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/audit.ts#L137) |
