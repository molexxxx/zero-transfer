[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / joinRemotePath

# Function: joinRemotePath()

```ts
function joinRemotePath(...segments): string;
```

Defined in: [src/utils/path.ts:85](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/utils/path.ts#L85)

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
