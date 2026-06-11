[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactValue

# Function: redactValue()

```ts
function redactValue(value): unknown;
```

Defined in: [src/logging/redaction.ts:44](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/logging/redaction.ts#L44)

Recursively redacts strings, arrays, and plain object values.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | Arbitrary value to sanitize for diagnostics. |

## Returns

`unknown`

A redacted copy for arrays and objects, or the original primitive value.
