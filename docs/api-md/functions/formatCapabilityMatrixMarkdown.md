[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / formatCapabilityMatrixMarkdown

# Function: formatCapabilityMatrixMarkdown()

```ts
function formatCapabilityMatrixMarkdown(matrix?): string;
```

Defined in: [src/providers/capabilityMatrix.ts:145](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/capabilityMatrix.ts#L145)

Renders the matrix returned by [getBuiltinCapabilityMatrix](getBuiltinCapabilityMatrix.md) as a
GitHub-flavored Markdown table covering the most commonly-compared
capability flags.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `matrix` | readonly [`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[] |

## Returns

`string`
