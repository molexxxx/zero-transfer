[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:21](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/logging/redaction.ts#L21)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
