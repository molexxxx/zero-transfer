[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MemoryProviderEntry

# Interface: MemoryProviderEntry

Defined in: [src/providers/memory/MemoryProvider.ts:64](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/memory/MemoryProvider.ts#L64)

Fixture entry used to seed a memory provider instance.

## Extends

- `Omit`\<[`RemoteEntry`](RemoteEntry.md), `"name"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="accessedat"></a> `accessedAt?` | `Date` | Last access time when the protocol exposes it. | [`RemoteEntry`](RemoteEntry.md).[`accessedAt`](RemoteEntry.md#accessedat) | [src/types/public.ts:53](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L53) |
| <a id="content"></a> `content?` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Optional byte content for file entries. Strings are encoded as UTF-8. | - | [src/providers/memory/MemoryProvider.ts:68](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/memory/MemoryProvider.ts#L68) |
| <a id="createdat"></a> `createdAt?` | `Date` | Creation time when the protocol exposes it. | [`RemoteEntry`](RemoteEntry.md).[`createdAt`](RemoteEntry.md#createdat) | [src/types/public.ts:51](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L51) |
| <a id="group"></a> `group?` | `string` | Group name or id when known. | [`RemoteEntry`](RemoteEntry.md).[`group`](RemoteEntry.md#group) | [src/types/public.ts:59](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L59) |
| <a id="modifiedat"></a> `modifiedAt?` | `Date` | Last modification time when known. | [`RemoteEntry`](RemoteEntry.md).[`modifiedAt`](RemoteEntry.md#modifiedat) | [src/types/public.ts:49](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L49) |
| <a id="name"></a> `name?` | `string` | Entry basename. When omitted, it is derived from `path`. | - | [src/providers/memory/MemoryProvider.ts:66](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/providers/memory/MemoryProvider.ts#L66) |
| <a id="owner"></a> `owner?` | `string` | Owner name or id when known. | [`RemoteEntry`](RemoteEntry.md).[`owner`](RemoteEntry.md#owner) | [src/types/public.ts:57](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L57) |
| <a id="path"></a> `path` | `string` | Absolute or normalized remote path for the entry. | [`RemoteEntry`](RemoteEntry.md).[`path`](RemoteEntry.md#path) | [src/types/public.ts:41](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L41) |
| <a id="permissions"></a> `permissions?` | [`RemotePermissions`](RemotePermissions.md) | Portable permission details when known. | [`RemoteEntry`](RemoteEntry.md).[`permissions`](RemoteEntry.md#permissions) | [src/types/public.ts:55](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L55) |
| <a id="raw"></a> `raw?` | `unknown` | Raw protocol payload retained for diagnostics or advanced callers. | [`RemoteEntry`](RemoteEntry.md).[`raw`](RemoteEntry.md#raw) | [src/types/public.ts:65](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L65) |
| <a id="size"></a> `size?` | `number` | Entry size in bytes when known. | [`RemoteEntry`](RemoteEntry.md).[`size`](RemoteEntry.md#size) | [src/types/public.ts:47](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L47) |
| <a id="symlinktarget"></a> `symlinkTarget?` | `string` | Target path for symbolic links when known. | [`RemoteEntry`](RemoteEntry.md).[`symlinkTarget`](RemoteEntry.md#symlinktarget) | [src/types/public.ts:61](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L61) |
| <a id="type"></a> `type` | [`RemoteEntryType`](../type-aliases/RemoteEntryType.md) | Normalized entry kind. | [`RemoteEntry`](RemoteEntry.md).[`type`](RemoteEntry.md#type) | [src/types/public.ts:45](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L45) |
| <a id="uniqueid"></a> `uniqueId?` | `string` | Protocol-specific stable identity when available. | [`RemoteEntry`](RemoteEntry.md).[`uniqueId`](RemoteEntry.md#uniqueid) | [src/types/public.ts:63](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L63) |
