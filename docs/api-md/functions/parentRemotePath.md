[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parentRemotePath

# Function: parentRemotePath()

```ts
function parentRemotePath(input): string;
```

Defined in: [src/sync/createRemoteBrowser.ts:85](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/sync/createRemoteBrowser.ts#L85)

Returns the parent directory of a remote path, or `"/"` for root inputs.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path to inspect. |

## Returns

`string`

The parent path normalized to an absolute form.
