[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / formatCapabilityMatrixMarkdown

# Function: formatCapabilityMatrixMarkdown()

```ts
function formatCapabilityMatrixMarkdown(matrix?): string;
```

Defined in: [src/providers/capabilityMatrix.ts:145](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/providers/capabilityMatrix.ts#L145)

Renders the matrix returned by [getBuiltinCapabilityMatrix](getBuiltinCapabilityMatrix.md) as a
GitHub-flavored Markdown table covering the most commonly-compared
capability flags.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `matrix` | readonly [`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[] |

## Returns

`string`
