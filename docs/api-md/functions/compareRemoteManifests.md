[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / compareRemoteManifests

# Function: compareRemoteManifests()

```ts
function compareRemoteManifests(
   source, 
   destination, 
   options?): RemoteTreeDiff;
```

Defined in: [src/sync/manifest.ts:225](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/sync/manifest.ts#L225)

Compares two manifests and produces an entry-level diff.

The comparison is performed on the relative-path keys recorded inside each manifest;
the absolute roots may differ between snapshots (e.g. captured against `/site` on the
source and `/var/www/site` on the destination).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`RemoteManifest`](../interfaces/RemoteManifest.md) | Source-side manifest snapshot. |
| `destination` | [`RemoteManifest`](../interfaces/RemoteManifest.md) | Destination-side manifest snapshot. |
| `options` | [`CompareRemoteManifestsOptions`](../interfaces/CompareRemoteManifestsOptions.md) | Optional comparison controls. |

## Returns

[`RemoteTreeDiff`](../interfaces/RemoteTreeDiff.md)

Diff result mirroring [RemoteTreeDiff](../interfaces/RemoteTreeDiff.md).
