[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:21](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/logging/redaction.ts#L21)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
