[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / redactObject

# Function: redactObject()

```ts
function redactObject(input): Record<string, unknown>;
```

Defined in: [src/logging/redaction.ts:65](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/redaction.ts#L65)

Redacts sensitive keys and nested values in a plain object.

## Parameters

| Parameter | Type                            | Description                          |
| --------- | ------------------------------- | ------------------------------------ |
| `input`   | `Record`\<`string`, `unknown`\> | Object containing diagnostic fields. |

## Returns

`Record`\<`string`, `unknown`\>

A shallow object copy with sensitive fields and nested secrets redacted.
