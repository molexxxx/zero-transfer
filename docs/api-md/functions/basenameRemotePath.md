[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / basenameRemotePath

# Function: basenameRemotePath()

```ts
function basenameRemotePath(input): string;
```

Defined in: [src/utils/path.ts:100](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/utils/path.ts#L100)

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
