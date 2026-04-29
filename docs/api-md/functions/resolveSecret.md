[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / resolveSecret

# Function: resolveSecret()

```ts
function resolveSecret(source, options?): Promise<SecretValue>;
```

Defined in: [src/profiles/SecretSource.ts:68](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/profiles/SecretSource.ts#L68)

Resolves a secret source into a string or Buffer without logging the value.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SecretSource`](../type-aliases/SecretSource.md) | Secret source to resolve. |
| `options` | [`ResolveSecretOptions`](../interfaces/ResolveSecretOptions.md) | Optional env and file-reader overrides. |

## Returns

`Promise`\<[`SecretValue`](../type-aliases/SecretValue.md)\>

Resolved secret value.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When a descriptor is invalid or unavailable.
