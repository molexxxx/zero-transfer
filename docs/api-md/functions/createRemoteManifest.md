[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createRemoteManifest

# Function: createRemoteManifest()

```ts
function createRemoteManifest(
   fs, 
   rootPath, 
options?): Promise<RemoteManifest>;
```

Defined in: [src/sync/manifest.ts:100](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L100)

Walks a remote subtree and produces a serializable manifest snapshot.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fs` | [`RemoteFileSystem`](../interfaces/RemoteFileSystem.md) | Remote file system to capture. |
| `rootPath` | `string` | Root path the manifest is anchored to. |
| `options` | [`CreateRemoteManifestOptions`](../interfaces/CreateRemoteManifestOptions.md) | Optional capture controls. |

## Returns

`Promise`\<[`RemoteManifest`](../interfaces/RemoteManifest.md)\>

Manifest snapshot suitable for serialization or comparison.
