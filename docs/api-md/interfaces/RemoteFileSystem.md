[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteFileSystem

# Interface: RemoteFileSystem

Defined in: [src/providers/RemoteFileSystem.ts:18](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L18)

Minimal file-system surface shared by provider sessions.

## Methods

### list()

```ts
list(path, options?): Promise<RemoteEntry[]>;
```

Defined in: [src/providers/RemoteFileSystem.ts:20](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L20)

Lists entries for a provider path.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options?` | [`ListOptions`](ListOptions.md) |

#### Returns

`Promise`\<[`RemoteEntry`](RemoteEntry.md)[]\>

***

### mkdir()?

```ts
optional mkdir(path, options?): Promise<void>;
```

Defined in: [src/providers/RemoteFileSystem.ts:28](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L28)

Creates a directory when supported by the provider.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options?` | [`MkdirOptions`](MkdirOptions.md) |

#### Returns

`Promise`\<`void`\>

***

### remove()?

```ts
optional remove(path, options?): Promise<void>;
```

Defined in: [src/providers/RemoteFileSystem.ts:24](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L24)

Removes a file entry when supported by the provider.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options?` | [`RemoveOptions`](RemoveOptions.md) |

#### Returns

`Promise`\<`void`\>

***

### rename()?

```ts
optional rename(
   from, 
   to, 
options?): Promise<void>;
```

Defined in: [src/providers/RemoteFileSystem.ts:26](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L26)

Renames or moves an entry when supported by the provider.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `from` | `string` |
| `to` | `string` |
| `options?` | [`RenameOptions`](RenameOptions.md) |

#### Returns

`Promise`\<`void`\>

***

### rmdir()?

```ts
optional rmdir(path, options?): Promise<void>;
```

Defined in: [src/providers/RemoteFileSystem.ts:30](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L30)

Removes a directory when supported by the provider.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options?` | [`RmdirOptions`](RmdirOptions.md) |

#### Returns

`Promise`\<`void`\>

***

### stat()

```ts
stat(path, options?): Promise<RemoteStat>;
```

Defined in: [src/providers/RemoteFileSystem.ts:22](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/providers/RemoteFileSystem.ts#L22)

Reads metadata for a provider path.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options?` | [`StatOptions`](StatOptions.md) |

#### Returns

`Promise`\<[`RemoteStat`](RemoteStat.md)\>
