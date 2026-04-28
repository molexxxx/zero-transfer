[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / basenameRemotePath

# Function: basenameRemotePath()

```ts
function basenameRemotePath(input): string;
```

Defined in: [src/utils/path.ts:100](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/utils/path.ts#L100)

Extracts the final name segment from a normalized remote path.

## Parameters

| Parameter | Type     | Description             |
| --------- | -------- | ----------------------- |
| `input`   | `string` | Remote path to inspect. |

## Returns

`string`

The final path segment, or `/` when the input is the absolute root.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input contains unsafe characters.
