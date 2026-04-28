[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RemoteTreeEntry

# Interface: RemoteTreeEntry

Defined in: [src/sync/walkRemoteTree.ts:33](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L33)

Walk record yielded by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property                             | Type                            | Description                                      | Defined in                                                                                                                                                |
| ------------------------------------ | ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="depth"></a> `depth`           | `number`                        | Zero-based depth relative to the traversal root. | [src/sync/walkRemoteTree.ts:37](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L37) |
| <a id="entry"></a> `entry`           | [`RemoteEntry`](RemoteEntry.md) | Visited remote entry.                            | [src/sync/walkRemoteTree.ts:35](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L35) |
| <a id="parentpath"></a> `parentPath` | `string`                        | Normalized parent directory path.                | [src/sync/walkRemoteTree.ts:39](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L39) |
