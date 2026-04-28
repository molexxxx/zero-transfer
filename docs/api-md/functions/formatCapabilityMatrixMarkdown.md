[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / formatCapabilityMatrixMarkdown

# Function: formatCapabilityMatrixMarkdown()

```ts
function formatCapabilityMatrixMarkdown(matrix?): string;
```

Defined in: [src/providers/capabilityMatrix.ts:145](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/capabilityMatrix.ts#L145)

Renders the matrix returned by [getBuiltinCapabilityMatrix](getBuiltinCapabilityMatrix.md) as a
GitHub-flavored Markdown table covering the most commonly-compared
capability flags.

## Parameters

| Parameter | Type                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `matrix`  | readonly [`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[] |

## Returns

`string`
