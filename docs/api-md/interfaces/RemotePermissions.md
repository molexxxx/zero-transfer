[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemotePermissions

# Interface: RemotePermissions

Defined in: [src/types/public.ts:24](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L24)

Portable permission metadata for a remote entry.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="group"></a> `group?` | `string` | Group permission component when the protocol exposes it. | [src/types/public.ts:30](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L30) |
| <a id="other"></a> `other?` | `string` | Other/world permission component when the protocol exposes it. | [src/types/public.ts:32](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L32) |
| <a id="raw"></a> `raw?` | `string` | Raw protocol permission text, such as Unix mode characters or MLSD `perm` facts. | [src/types/public.ts:26](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L26) |
| <a id="user"></a> `user?` | `string` | User/owner permission component when the protocol exposes it. | [src/types/public.ts:28](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L28) |
