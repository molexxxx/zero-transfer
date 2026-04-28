[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemotePermissions

# Interface: RemotePermissions

Defined in: [src/types/public.ts:25](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L25)

Portable permission metadata for a remote entry.

## Properties

| Property                    | Type     | Description                                                                      | Defined in                                                                                                                                  |
| --------------------------- | -------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="group"></a> `group?` | `string` | Group permission component when the protocol exposes it.                         | [src/types/public.ts:31](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L31) |
| <a id="other"></a> `other?` | `string` | Other/world permission component when the protocol exposes it.                   | [src/types/public.ts:33](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L33) |
| <a id="raw"></a> `raw?`     | `string` | Raw protocol permission text, such as Unix mode characters or MLSD `perm` facts. | [src/types/public.ts:27](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L27) |
| <a id="user"></a> `user?`   | `string` | User/owner permission component when the protocol exposes it.                    | [src/types/public.ts:29](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L29) |
