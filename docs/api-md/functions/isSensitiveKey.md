[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:21](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/logging/redaction.ts#L21)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
