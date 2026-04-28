[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / joinRemotePath

# Function: joinRemotePath()

```ts
function joinRemotePath(...segments): string;
```

Defined in: [src/utils/path.ts:85](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/utils/path.ts#L85)

Joins remote path segments and normalizes the result.

## Parameters

| Parameter     | Type       | Description                          |
| ------------- | ---------- | ------------------------------------ |
| ...`segments` | `string`[] | Remote path segments to concatenate. |

## Returns

`string`

A normalized remote path.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When any joined segment contains unsafe characters.
