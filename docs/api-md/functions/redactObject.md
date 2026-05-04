[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactObject

# Function: redactObject()

```ts
function redactObject(input): Record<string, unknown>;
```

Defined in: [src/logging/redaction.ts:65](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/logging/redaction.ts#L65)

Redacts sensitive keys and nested values in a plain object.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `Record`\<`string`, `unknown`\> | Object containing diagnostic fields. |

## Returns

`Record`\<`string`, `unknown`\>

A shallow object copy with sensitive fields and nested secrets redacted.
