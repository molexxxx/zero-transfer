[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isMainModule

# Function: isMainModule()

```ts
function isMainModule(importMetaUrl): boolean;
```

Defined in: [src/utils/mainModule.ts:19](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/utils/mainModule.ts#L19)

Returns `true` when the file containing `import.meta.url` is the entry point
of the current Node.js process. Returns `false` outside Node.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `importMetaUrl` | `string` |

## Returns

`boolean`
