[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactValue

# Function: redactValue()

```ts
function redactValue(value): unknown;
```

Defined in: [src/logging/redaction.ts:43](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/logging/redaction.ts#L43)

Recursively redacts strings, arrays, and plain object values.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | Arbitrary value to sanitize for diagnostics. |

## Returns

`unknown`

A redacted copy for arrays and objects, or the original primitive value.
