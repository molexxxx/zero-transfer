[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:21](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/logging/redaction.ts#L21)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| `key`     | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
