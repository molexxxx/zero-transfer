[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parentRemotePath

# Function: parentRemotePath()

```ts
function parentRemotePath(input): string;
```

Defined in: [src/sync/createRemoteBrowser.ts:85](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/sync/createRemoteBrowser.ts#L85)

Returns the parent directory of a remote path, or `"/"` for root inputs.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path to inspect. |

## Returns

`string`

The parent path normalized to an absolute form.
