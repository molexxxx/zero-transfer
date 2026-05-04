[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isClassicProviderId

# Function: isClassicProviderId()

```ts
function isClassicProviderId(providerId): providerId is "ftp" | "ftps" | "sftp";
```

Defined in: [src/core/ProviderId.ts:45](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/core/ProviderId.ts#L45)

Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) \| `undefined` | Provider id to inspect. |

## Returns

providerId is "ftp" \| "ftps" \| "sftp"

`true` when the id is one of the classic protocol providers.
