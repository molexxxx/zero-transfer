[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isMainModule

# Function: isMainModule()

```ts
function isMainModule(importMetaUrl): boolean;
```

Defined in: [src/utils/mainModule.ts:19](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/utils/mainModule.ts#L19)

Returns `true` when the file containing `import.meta.url` is the entry point
of the current Node.js process. Returns `false` outside Node.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `importMetaUrl` | `string` |

## Returns

`boolean`
