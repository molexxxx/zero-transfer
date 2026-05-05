[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / formatCapabilityMatrixMarkdown

# Function: formatCapabilityMatrixMarkdown()

```ts
function formatCapabilityMatrixMarkdown(matrix?): string;
```

Defined in: [src/providers/capabilityMatrix.ts:146](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/capabilityMatrix.ts#L146)

Renders the matrix returned by [getBuiltinCapabilityMatrix](getBuiltinCapabilityMatrix.md) as a
GitHub-flavored Markdown table covering the most commonly-compared
capability flags.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `matrix` | readonly [`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[] |

## Returns

`string`
