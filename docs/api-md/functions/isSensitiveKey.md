[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:21](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/logging/redaction.ts#L21)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
