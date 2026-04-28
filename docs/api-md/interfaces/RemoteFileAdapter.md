[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RemoteFileAdapter

# Interface: RemoteFileAdapter

Defined in: [src/protocols/RemoteFileAdapter.ts:20](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/protocols/RemoteFileAdapter.ts#L20)

Minimal remote-file adapter required by the current alpha facade.

## Methods

### connect()

```ts
connect(profile): Promise<void>;
```

Defined in: [src/protocols/RemoteFileAdapter.ts:27](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/protocols/RemoteFileAdapter.ts#L27)

Opens a remote connection.

#### Parameters

| Parameter | Type                                        | Description                                                           |
| --------- | ------------------------------------------- | --------------------------------------------------------------------- |
| `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Host, authentication, protocol, timeout, signal, and logger settings. |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the remote session is ready for operations.

---

### disconnect()

```ts
disconnect(): Promise<void>;
```

Defined in: [src/protocols/RemoteFileAdapter.ts:34](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/protocols/RemoteFileAdapter.ts#L34)

Closes the remote connection and releases protocol resources.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the remote session is fully closed.

---

### list()

```ts
list(path, options?): Promise<RemoteEntry[]>;
```

Defined in: [src/protocols/RemoteFileAdapter.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/protocols/RemoteFileAdapter.ts#L43)

Lists entries for a remote directory.

#### Parameters

| Parameter  | Type                            | Description                                                   |
| ---------- | ------------------------------- | ------------------------------------------------------------- |
| `path`     | `string`                        | Remote directory path to list.                                |
| `options?` | [`ListOptions`](ListOptions.md) | Optional listing controls such as recursion and abort signal. |

#### Returns

`Promise`\<[`RemoteEntry`](RemoteEntry.md)[]\>

Normalized remote entries contained by the requested path.

---

### stat()

```ts
stat(path, options?): Promise<RemoteStat>;
```

Defined in: [src/protocols/RemoteFileAdapter.ts:52](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/protocols/RemoteFileAdapter.ts#L52)

Reads metadata for a remote entry.

#### Parameters

| Parameter  | Type                            | Description                                  |
| ---------- | ------------------------------- | -------------------------------------------- |
| `path`     | `string`                        | Remote path to inspect.                      |
| `options?` | [`StatOptions`](StatOptions.md) | Optional stat controls such as abort signal. |

#### Returns

`Promise`\<[`RemoteStat`](RemoteStat.md)\>

Normalized metadata for an existing remote entry.
