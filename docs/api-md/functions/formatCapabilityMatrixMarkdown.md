[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / formatCapabilityMatrixMarkdown

# Function: formatCapabilityMatrixMarkdown()

```ts
function formatCapabilityMatrixMarkdown(matrix?): string;
```

Defined in: [src/providers/capabilityMatrix.ts:146](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/providers/capabilityMatrix.ts#L146)

Renders the matrix returned by [getBuiltinCapabilityMatrix](getBuiltinCapabilityMatrix.md) as a
GitHub-flavored Markdown table covering the most commonly-compared
capability flags.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `matrix` | readonly [`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[] |

## Returns

`string`
