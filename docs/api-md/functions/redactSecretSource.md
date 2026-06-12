[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactSecretSource

# Function: redactSecretSource()

```ts
function redactSecretSource(source): unknown;
```

Defined in: [src/profiles/SecretSource.ts:132](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/SecretSource.ts#L132)

Redacts a secret source or resolved secret for safe diagnostics.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`ValueSecretSource`](../interfaces/ValueSecretSource.md) \| [`EnvSecretSource`](../interfaces/EnvSecretSource.md) \| [`Base64EnvSecretSource`](../interfaces/Base64EnvSecretSource.md) \| [`FileSecretSource`](../interfaces/FileSecretSource.md) \| [`SecretProvider`](../type-aliases/SecretProvider.md) | Secret source or resolved value to sanitize. |

## Returns

`unknown`

Redacted placeholder or descriptor shape.
