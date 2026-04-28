[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createRemoteManifest

# Function: createRemoteManifest()

```ts
function createRemoteManifest(fs, rootPath, options?): Promise<RemoteManifest>;
```

Defined in: [src/sync/manifest.ts:100](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/manifest.ts#L100)

Walks a remote subtree and produces a serializable manifest snapshot.

## Parameters

| Parameter  | Type                                                                          | Description                            |
| ---------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| `fs`       | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md)                       | Remote file system to capture.         |
| `rootPath` | `string`                                                                      | Root path the manifest is anchored to. |
| `options`  | [`CreateRemoteManifestOptions`](../interfaces/CreateRemoteManifestOptions.md) | Optional capture controls.             |

## Returns

`Promise`\<[`RemoteManifest`](../interfaces/RemoteManifest.md)\>

Manifest snapshot suitable for serialization or comparison.
