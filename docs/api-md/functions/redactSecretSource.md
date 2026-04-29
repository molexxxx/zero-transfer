[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactSecretSource

# Function: redactSecretSource()

```ts
function redactSecretSource(source): unknown;
```

Defined in: [src/profiles/SecretSource.ts:132](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/profiles/SecretSource.ts#L132)

Redacts a secret source or resolved secret for safe diagnostics.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`ValueSecretSource`](../interfaces/ValueSecretSource.md) \| [`EnvSecretSource`](../interfaces/EnvSecretSource.md) \| [`Base64EnvSecretSource`](../interfaces/Base64EnvSecretSource.md) \| [`FileSecretSource`](../interfaces/FileSecretSource.md) \| [`SecretProvider`](../type-aliases/SecretProvider.md) | Secret source or resolved value to sanitize. |

## Returns

`unknown`

Redacted placeholder or descriptor shape.
