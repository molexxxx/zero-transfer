[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / basenameRemotePath

# Function: basenameRemotePath()

```ts
function basenameRemotePath(input): string;
```

Defined in: [src/utils/path.ts:100](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/utils/path.ts#L100)

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
