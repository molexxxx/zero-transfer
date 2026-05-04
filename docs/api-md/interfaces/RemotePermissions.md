[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemotePermissions

# Interface: RemotePermissions

Defined in: [src/types/public.ts:24](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/types/public.ts#L24)

Portable permission metadata for a remote entry.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="group"></a> `group?` | `string` | Group permission component when the protocol exposes it. | [src/types/public.ts:30](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/types/public.ts#L30) |
| <a id="other"></a> `other?` | `string` | Other/world permission component when the protocol exposes it. | [src/types/public.ts:32](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/types/public.ts#L32) |
| <a id="raw"></a> `raw?` | `string` | Raw protocol permission text, such as Unix mode characters or MLSD `perm` facts. | [src/types/public.ts:26](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/types/public.ts#L26) |
| <a id="user"></a> `user?` | `string` | User/owner permission component when the protocol exposes it. | [src/types/public.ts:28](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/types/public.ts#L28) |
