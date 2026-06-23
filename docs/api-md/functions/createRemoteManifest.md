[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createRemoteManifest

# Function: createRemoteManifest()

```ts
function createRemoteManifest(
   fs, 
   rootPath, 
options?): Promise<RemoteManifest>;
```

Defined in: [src/sync/manifest.ts:100](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/manifest.ts#L100)

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
