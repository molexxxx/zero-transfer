[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / assertSafeFtpArgument

# Function: assertSafeFtpArgument()

```ts
function assertSafeFtpArgument(value, label?): string;
```

Defined in: [src/utils/path.ts:26](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/utils/path.ts#L26)

Validates that an FTP command argument cannot inject additional command lines.

NUL bytes are rejected alongside CR/LF: C-string-based servers and filesystem
APIs truncate at the first NUL, which lets a crafted path smuggle a different
effective target past validation.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `string` | `undefined` | Argument value to validate. |
| `label` | `string` | `"path"` | Human-readable argument label used in error messages. |

## Returns

`string`

The original value when it is safe.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the value contains CR, LF, or NUL characters.
