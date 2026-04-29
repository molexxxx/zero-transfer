[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / joinRemotePath

# Function: joinRemotePath()

```ts
function joinRemotePath(...segments): string;
```

Defined in: [src/utils/path.ts:85](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/utils/path.ts#L85)

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
