[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isMainModule

# Function: isMainModule()

```ts
function isMainModule(importMetaUrl): boolean;
```

Defined in: [src/utils/mainModule.ts:19](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/utils/mainModule.ts#L19)

Returns `true` when the file containing `import.meta.url` is the entry point
of the current Node.js process. Returns `false` outside Node.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `importMetaUrl` | `string` |

## Returns

`boolean`
