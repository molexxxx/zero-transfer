[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / basenameRemotePath

# Function: basenameRemotePath()

```ts
function basenameRemotePath(input): string;
```

Defined in: [src/utils/path.ts:100](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/utils/path.ts#L100)

Extracts the final name segment from a normalized remote path.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path to inspect. |

## Returns

`string`

The final path segment, or `/` when the input is the absolute root.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input contains unsafe characters.
