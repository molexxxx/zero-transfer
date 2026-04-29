[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / walkRemoteTree

# Function: walkRemoteTree()

```ts
function walkRemoteTree(
   fs, 
   rootPath, 
options?): AsyncGenerator<RemoteTreeEntry>;
```

Defined in: [src/sync/walkRemoteTree.ts:55](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/walkRemoteTree.ts#L55)

Walks a remote file system depth-first, yielding entries in a stable order.

Listings are sorted by entry path within each directory so output is deterministic
across providers. Errors thrown by `fs.list()` propagate; callers can supply a
filter to skip directories that should not be traversed.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fs` | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md) | Remote file system used for listings. |
| `rootPath` | `string` | Root directory to walk. |
| `options` | [`WalkRemoteTreeOptions`](../interfaces/WalkRemoteTreeOptions.md) | Optional traversal controls. |

## Returns

`AsyncGenerator`\<[`RemoteTreeEntry`](../interfaces/RemoteTreeEntry.md)\>

Async generator emitting [RemoteTreeEntry](../interfaces/RemoteTreeEntry.md) records.

## Throws

[AbortError](../classes/AbortError.md) When the supplied abort signal is cancelled mid-walk.
