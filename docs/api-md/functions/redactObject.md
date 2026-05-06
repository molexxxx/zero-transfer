[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactObject

# Function: redactObject()

```ts
function redactObject(input): Record<string, unknown>;
```

Defined in: [src/logging/redaction.ts:65](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/logging/redaction.ts#L65)

Redacts sensitive keys and nested values in a plain object.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `Record`\<`string`, `unknown`\> | Object containing diagnostic fields. |

## Returns

`Record`\<`string`, `unknown`\>

A shallow object copy with sensitive fields and nested secrets redacted.
