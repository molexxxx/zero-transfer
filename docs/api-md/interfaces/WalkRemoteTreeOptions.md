[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WalkRemoteTreeOptions

# Interface: WalkRemoteTreeOptions

Defined in: [src/sync/walkRemoteTree.ts:15](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L15)

Options accepted by [walkRemoteTree](../functions/walkRemoteTree.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="filter"></a> `filter?` | [`RemoteTreeFilter`](../type-aliases/RemoteTreeFilter.md) | Optional filter applied before yielding and before descending into directories. | [src/sync/walkRemoteTree.ts:27](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L27) |
| <a id="followsymlinks"></a> `followSymlinks?` | `boolean` | Whether to follow symlinks during traversal. Defaults to `false`. | [src/sync/walkRemoteTree.ts:25](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L25) |
| <a id="includedirectories"></a> `includeDirectories?` | `boolean` | Whether to include directory entries in the output. Defaults to `true`. | [src/sync/walkRemoteTree.ts:21](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L21) |
| <a id="includefiles"></a> `includeFiles?` | `boolean` | Whether to include file entries in the output. Defaults to `true`. | [src/sync/walkRemoteTree.ts:23](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L23) |
| <a id="maxdepth"></a> `maxDepth?` | `number` | Maximum traversal depth. `0` walks only the root listing. Unbounded by default. | [src/sync/walkRemoteTree.ts:19](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L19) |
| <a id="recursive"></a> `recursive?` | `boolean` | Whether to descend into subdirectories. Defaults to `true`. | [src/sync/walkRemoteTree.ts:17](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L17) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Optional abort signal that interrupts traversal between listings. | [src/sync/walkRemoteTree.ts:29](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L29) |
