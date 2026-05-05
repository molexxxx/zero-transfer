[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteEntry

# Interface: RemoteEntry

Defined in: [src/types/public.ts:38](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L38)

Normalized remote file-system entry.

## Extended by

- [`RemoteStat`](RemoteStat.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="accessedat"></a> `accessedAt?` | `Date` | Last access time when the protocol exposes it. | [src/types/public.ts:52](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L52) |
| <a id="createdat"></a> `createdAt?` | `Date` | Creation time when the protocol exposes it. | [src/types/public.ts:50](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L50) |
| <a id="group"></a> `group?` | `string` | Group name or id when known. | [src/types/public.ts:58](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L58) |
| <a id="modifiedat"></a> `modifiedAt?` | `Date` | Last modification time when known. | [src/types/public.ts:48](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L48) |
| <a id="name"></a> `name` | `string` | Entry basename without parent directory segments. | [src/types/public.ts:42](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L42) |
| <a id="owner"></a> `owner?` | `string` | Owner name or id when known. | [src/types/public.ts:56](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L56) |
| <a id="path"></a> `path` | `string` | Absolute or normalized remote path for the entry. | [src/types/public.ts:40](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L40) |
| <a id="permissions"></a> `permissions?` | [`RemotePermissions`](RemotePermissions.md) | Portable permission details when known. | [src/types/public.ts:54](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L54) |
| <a id="raw"></a> `raw?` | `unknown` | Raw protocol payload retained for diagnostics or advanced callers. | [src/types/public.ts:64](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L64) |
| <a id="size"></a> `size?` | `number` | Entry size in bytes when known. | [src/types/public.ts:46](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L46) |
| <a id="symlinktarget"></a> `symlinkTarget?` | `string` | Target path for symbolic links when known. | [src/types/public.ts:60](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L60) |
| <a id="type"></a> `type` | [`RemoteEntryType`](../type-aliases/RemoteEntryType.md) | Normalized entry kind. | [src/types/public.ts:44](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L44) |
| <a id="uniqueid"></a> `uniqueId?` | `string` | Protocol-specific stable identity when available. | [src/types/public.ts:62](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/types/public.ts#L62) |
