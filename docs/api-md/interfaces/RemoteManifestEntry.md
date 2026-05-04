[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteManifestEntry

# Interface: RemoteManifestEntry

Defined in: [src/sync/manifest.ts:32](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L32)

Manifest entry recorded for each visited remote node.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="modifiedat"></a> `modifiedAt?` | `string` | Last modification time as an ISO 8601 timestamp when known. | [src/sync/manifest.ts:40](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L40) |
| <a id="path"></a> `path` | `string` | Path relative to [RemoteManifest.root](RemoteManifest.md#root), beginning with `/`. | [src/sync/manifest.ts:34](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L34) |
| <a id="size"></a> `size?` | `number` | Entry size in bytes when known. | [src/sync/manifest.ts:38](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L38) |
| <a id="symlinktarget"></a> `symlinkTarget?` | `string` | Target path for symbolic links when known. | [src/sync/manifest.ts:44](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L44) |
| <a id="type"></a> `type` | [`RemoteEntryType`](../type-aliases/RemoteEntryType.md) | Entry kind. | [src/sync/manifest.ts:36](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L36) |
| <a id="uniqueid"></a> `uniqueId?` | `string` | Protocol-specific stable identity when available. | [src/sync/manifest.ts:42](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/manifest.ts#L42) |
