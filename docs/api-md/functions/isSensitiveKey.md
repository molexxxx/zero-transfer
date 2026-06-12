[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isSensitiveKey

# Function: isSensitiveKey()

```ts
function isSensitiveKey(key): boolean;
```

Defined in: [src/logging/redaction.ts:22](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/logging/redaction.ts#L22)

Checks whether an object key is likely to contain sensitive data.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Object key to inspect. |

## Returns

`boolean`

`true` when the key name should be redacted.
