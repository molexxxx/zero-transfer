[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteStat

# Interface: RemoteStat

Defined in: [src/types/public.ts:70](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L70)

Metadata for a remote entry that is known to exist.

## Extends

- [`RemoteEntry`](RemoteEntry.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="accessedat"></a> `accessedAt?` | `Date` | Last access time when the protocol exposes it. | [`RemoteEntry`](RemoteEntry.md).[`accessedAt`](RemoteEntry.md#accessedat) | [src/types/public.ts:52](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L52) |
| <a id="createdat"></a> `createdAt?` | `Date` | Creation time when the protocol exposes it. | [`RemoteEntry`](RemoteEntry.md).[`createdAt`](RemoteEntry.md#createdat) | [src/types/public.ts:50](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L50) |
| <a id="exists"></a> `exists` | `true` | Existence discriminator for successful stat operations. | - | [src/types/public.ts:72](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L72) |
| <a id="group"></a> `group?` | `string` | Group name or id when known. | [`RemoteEntry`](RemoteEntry.md).[`group`](RemoteEntry.md#group) | [src/types/public.ts:58](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L58) |
| <a id="modifiedat"></a> `modifiedAt?` | `Date` | Last modification time when known. | [`RemoteEntry`](RemoteEntry.md).[`modifiedAt`](RemoteEntry.md#modifiedat) | [src/types/public.ts:48](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L48) |
| <a id="name"></a> `name` | `string` | Entry basename without parent directory segments. | [`RemoteEntry`](RemoteEntry.md).[`name`](RemoteEntry.md#name) | [src/types/public.ts:42](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L42) |
| <a id="owner"></a> `owner?` | `string` | Owner name or id when known. | [`RemoteEntry`](RemoteEntry.md).[`owner`](RemoteEntry.md#owner) | [src/types/public.ts:56](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L56) |
| <a id="path"></a> `path` | `string` | Absolute or normalized remote path for the entry. | [`RemoteEntry`](RemoteEntry.md).[`path`](RemoteEntry.md#path) | [src/types/public.ts:40](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L40) |
| <a id="permissions"></a> `permissions?` | [`RemotePermissions`](RemotePermissions.md) | Portable permission details when known. | [`RemoteEntry`](RemoteEntry.md).[`permissions`](RemoteEntry.md#permissions) | [src/types/public.ts:54](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L54) |
| <a id="raw"></a> `raw?` | `unknown` | Raw protocol payload retained for diagnostics or advanced callers. | [`RemoteEntry`](RemoteEntry.md).[`raw`](RemoteEntry.md#raw) | [src/types/public.ts:64](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L64) |
| <a id="size"></a> `size?` | `number` | Entry size in bytes when known. | [`RemoteEntry`](RemoteEntry.md).[`size`](RemoteEntry.md#size) | [src/types/public.ts:46](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L46) |
| <a id="symlinktarget"></a> `symlinkTarget?` | `string` | Target path for symbolic links when known. | [`RemoteEntry`](RemoteEntry.md).[`symlinkTarget`](RemoteEntry.md#symlinktarget) | [src/types/public.ts:60](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L60) |
| <a id="type"></a> `type` | [`RemoteEntryType`](../type-aliases/RemoteEntryType.md) | Normalized entry kind. | [`RemoteEntry`](RemoteEntry.md).[`type`](RemoteEntry.md#type) | [src/types/public.ts:44](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L44) |
| <a id="uniqueid"></a> `uniqueId?` | `string` | Protocol-specific stable identity when available. | [`RemoteEntry`](RemoteEntry.md).[`uniqueId`](RemoteEntry.md#uniqueid) | [src/types/public.ts:62](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/types/public.ts#L62) |
