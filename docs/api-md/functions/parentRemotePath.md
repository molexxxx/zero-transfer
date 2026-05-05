[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parentRemotePath

# Function: parentRemotePath()

```ts
function parentRemotePath(input): string;
```

Defined in: [src/sync/createRemoteBrowser.ts:85](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/createRemoteBrowser.ts#L85)

Returns the parent directory of a remote path, or `"/"` for root inputs.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path to inspect. |

## Returns

`string`

The parent path normalized to an absolute form.
