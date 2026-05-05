[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateRemoteManifestOptions

# Interface: CreateRemoteManifestOptions

Defined in: [src/sync/manifest.ts:62](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L62)

Options accepted by [createRemoteManifest](../functions/createRemoteManifest.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="filter"></a> `filter?` | [`RemoteTreeFilter`](../type-aliases/RemoteTreeFilter.md) | Filter applied during traversal. Overrides `walk.filter` when provided. | [src/sync/manifest.ts:69](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L69) |
| <a id="now"></a> `now?` | () => `Date` | Clock used to stamp `generatedAt`. Defaults to `Date.now`. | [src/sync/manifest.ts:73](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L73) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider identifier embedded into the manifest header. | [src/sync/manifest.ts:71](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L71) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Optional abort signal threaded through the walk. | [src/sync/manifest.ts:75](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L75) |
| <a id="walk"></a> `walk?` | `Pick`\<[`WalkRemoteTreeOptions`](WalkRemoteTreeOptions.md), \| `"filter"` \| `"recursive"` \| `"followSymlinks"` \| `"includeDirectories"` \| `"includeFiles"` \| `"maxDepth"`\> | Optional traversal controls forwarded to [walkRemoteTree](../functions/walkRemoteTree.md). | [src/sync/manifest.ts:64](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/manifest.ts#L64) |
