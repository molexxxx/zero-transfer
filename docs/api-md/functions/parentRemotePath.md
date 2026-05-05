[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parentRemotePath

# Function: parentRemotePath()

```ts
function parentRemotePath(input): string;
```

Defined in: [src/sync/createRemoteBrowser.ts:85](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createRemoteBrowser.ts#L85)

Returns the parent directory of a remote path, or `"/"` for root inputs.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path to inspect. |

## Returns

`string`

The parent path normalized to an absolute form.
