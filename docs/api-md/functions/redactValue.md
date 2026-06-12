[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactValue

# Function: redactValue()

```ts
function redactValue(value): unknown;
```

Defined in: [src/logging/redaction.ts:44](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/logging/redaction.ts#L44)

Recursively redacts strings, arrays, and plain object values.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | Arbitrary value to sanitize for diagnostics. |

## Returns

`unknown`

A redacted copy for arrays and objects, or the original primitive value.
