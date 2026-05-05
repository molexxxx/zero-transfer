[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteManifest

# Interface: RemoteManifest

Defined in: [src/sync/manifest.ts:48](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L48)

Persisted snapshot of a remote subtree.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="entries"></a> `entries` | [`RemoteManifestEntry`](RemoteManifestEntry.md)[] | Manifest entries sorted by path. | [src/sync/manifest.ts:58](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L58) |
| <a id="formatversion"></a> `formatVersion` | `number` | Schema version. Must equal [REMOTE\_MANIFEST\_FORMAT\_VERSION](../variables/REMOTE_MANIFEST_FORMAT_VERSION.md). | [src/sync/manifest.ts:50](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L50) |
| <a id="generatedat"></a> `generatedAt` | `string` | ISO 8601 timestamp recording when the manifest was generated. | [src/sync/manifest.ts:52](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L52) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Optional provider identifier the snapshot was captured from. | [src/sync/manifest.ts:56](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L56) |
| <a id="root"></a> `root` | `string` | Normalized absolute root path the manifest snapshot is anchored to. | [src/sync/manifest.ts:54](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/sync/manifest.ts#L54) |
