[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / walkRemoteTree

# Function: walkRemoteTree()

```ts
function walkRemoteTree(
   fs, 
   rootPath, 
options?): AsyncGenerator<RemoteTreeEntry>;
```

Defined in: [src/sync/walkRemoteTree.ts:55](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/walkRemoteTree.ts#L55)

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
