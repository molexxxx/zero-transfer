[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / joinRemotePath

# Function: joinRemotePath()

```ts
function joinRemotePath(...segments): string;
```

Defined in: [src/utils/path.ts:90](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/utils/path.ts#L90)

Joins remote path segments and normalizes the result.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`segments` | `string`[] | Remote path segments to concatenate. |

## Returns

`string`

A normalized remote path.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When any joined segment contains unsafe characters.
