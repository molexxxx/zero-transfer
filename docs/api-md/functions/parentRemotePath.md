[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / parentRemotePath

# Function: parentRemotePath()

```ts
function parentRemotePath(input): string;
```

Defined in: [src/sync/createRemoteBrowser.ts:85](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L85)

Returns the parent directory of a remote path, or `"/"` for root inputs.

## Parameters

| Parameter | Type     | Description             |
| --------- | -------- | ----------------------- |
| `input`   | `string` | Remote path to inspect. |

## Returns

`string`

The parent path normalized to an absolute form.
