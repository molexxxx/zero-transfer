[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isMainModule

# Function: isMainModule()

```ts
function isMainModule(importMetaUrl): boolean;
```

Defined in: [src/utils/mainModule.ts:19](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/utils/mainModule.ts#L19)

Returns `true` when the file containing `import.meta.url` is the entry point
of the current Node.js process. Returns `false` outside Node.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `importMetaUrl` | `string` |

## Returns

`boolean`
