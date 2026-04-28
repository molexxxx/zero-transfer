[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / redactValue

# Function: redactValue()

```ts
function redactValue(value): unknown;
```

Defined in: [src/logging/redaction.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/redaction.ts#L43)

Recursively redacts strings, arrays, and plain object values.

## Parameters

| Parameter | Type      | Description                                  |
| --------- | --------- | -------------------------------------------- |
| `value`   | `unknown` | Arbitrary value to sanitize for diagnostics. |

## Returns

`unknown`

A redacted copy for arrays and objects, or the original primitive value.
