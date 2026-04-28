[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemoteEntry

# Interface: RemoteEntry

Defined in: [src/types/public.ts:39](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L39)

Normalized remote file-system entry.

## Extended by

- [`RemoteStat`](RemoteStat.md)

## Properties

| Property                                    | Type                                                    | Description                                                        | Defined in                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="accessedat"></a> `accessedAt?`       | `Date`                                                  | Last access time when the protocol exposes it.                     | [src/types/public.ts:53](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L53) |
| <a id="createdat"></a> `createdAt?`         | `Date`                                                  | Creation time when the protocol exposes it.                        | [src/types/public.ts:51](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L51) |
| <a id="group"></a> `group?`                 | `string`                                                | Group name or id when known.                                       | [src/types/public.ts:59](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L59) |
| <a id="modifiedat"></a> `modifiedAt?`       | `Date`                                                  | Last modification time when known.                                 | [src/types/public.ts:49](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L49) |
| <a id="name"></a> `name`                    | `string`                                                | Entry basename without parent directory segments.                  | [src/types/public.ts:43](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L43) |
| <a id="owner"></a> `owner?`                 | `string`                                                | Owner name or id when known.                                       | [src/types/public.ts:57](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L57) |
| <a id="path"></a> `path`                    | `string`                                                | Absolute or normalized remote path for the entry.                  | [src/types/public.ts:41](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L41) |
| <a id="permissions"></a> `permissions?`     | [`RemotePermissions`](RemotePermissions.md)             | Portable permission details when known.                            | [src/types/public.ts:55](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L55) |
| <a id="raw"></a> `raw?`                     | `unknown`                                               | Raw protocol payload retained for diagnostics or advanced callers. | [src/types/public.ts:65](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L65) |
| <a id="size"></a> `size?`                   | `number`                                                | Entry size in bytes when known.                                    | [src/types/public.ts:47](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L47) |
| <a id="symlinktarget"></a> `symlinkTarget?` | `string`                                                | Target path for symbolic links when known.                         | [src/types/public.ts:61](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L61) |
| <a id="type"></a> `type`                    | [`RemoteEntryType`](../type-aliases/RemoteEntryType.md) | Normalized entry kind.                                             | [src/types/public.ts:45](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L45) |
| <a id="uniqueid"></a> `uniqueId?`           | `string`                                                | Protocol-specific stable identity when available.                  | [src/types/public.ts:63](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L63) |
