[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / assertSafeFtpArgument

# Function: assertSafeFtpArgument()

```ts
function assertSafeFtpArgument(value, label?): string;
```

Defined in: [src/utils/path.ts:21](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/utils/path.ts#L21)

Validates that an FTP command argument cannot inject additional command lines.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `string` | `undefined` | Argument value to validate. |
| `label` | `string` | `"path"` | Human-readable argument label used in error messages. |

## Returns

`string`

The original value when it is safe.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the value contains CR or LF characters.
