[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / walkRemoteTree

# Function: walkRemoteTree()

```ts
function walkRemoteTree(fs, rootPath, options?): AsyncGenerator<RemoteTreeEntry>;
```

Defined in: [src/sync/walkRemoteTree.ts:55](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L55)

Walks a remote file system depth-first, yielding entries in a stable order.

Listings are sorted by entry path within each directory so output is deterministic
across providers. Errors thrown by `fs.list()` propagate; callers can supply a
filter to skip directories that should not be traversed.

## Parameters

| Parameter  | Type                                                              | Description                           |
| ---------- | ----------------------------------------------------------------- | ------------------------------------- |
| `fs`       | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md)           | Remote file system used for listings. |
| `rootPath` | `string`                                                          | Root directory to walk.               |
| `options`  | [`WalkRemoteTreeOptions`](../interfaces/WalkRemoteTreeOptions.md) | Optional traversal controls.          |

## Returns

`AsyncGenerator`\<[`RemoteTreeEntry`](../interfaces/RemoteTreeEntry.md)\>

Async generator emitting [RemoteTreeEntry](../interfaces/RemoteTreeEntry.md) records.

## Throws

[AbortError](../classes/AbortError.md) When the supplied abort signal is cancelled mid-walk.
