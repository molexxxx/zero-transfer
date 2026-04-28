[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemoteFileSystem

# Interface: RemoteFileSystem

Defined in: [src/providers/RemoteFileSystem.ts:9](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/RemoteFileSystem.ts#L9)

Minimal file-system surface shared by provider sessions.

## Methods

### list()

```ts
list(path, options?): Promise<RemoteEntry[]>;
```

Defined in: [src/providers/RemoteFileSystem.ts:11](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/RemoteFileSystem.ts#L11)

Lists entries for a provider path.

#### Parameters

| Parameter  | Type                            |
| ---------- | ------------------------------- |
| `path`     | `string`                        |
| `options?` | [`ListOptions`](ListOptions.md) |

#### Returns

`Promise`\<[`RemoteEntry`](RemoteEntry.md)[]\>

---

### stat()

```ts
stat(path, options?): Promise<RemoteStat>;
```

Defined in: [src/providers/RemoteFileSystem.ts:13](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/RemoteFileSystem.ts#L13)

Reads metadata for a provider path.

#### Parameters

| Parameter  | Type                            |
| ---------- | ------------------------------- |
| `path`     | `string`                        |
| `options?` | [`StatOptions`](StatOptions.md) |

#### Returns

`Promise`\<[`RemoteStat`](RemoteStat.md)\>
