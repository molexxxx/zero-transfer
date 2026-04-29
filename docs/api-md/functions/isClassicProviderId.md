[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / isClassicProviderId

# Function: isClassicProviderId()

```ts
function isClassicProviderId(providerId): providerId is "ftp" | "ftps" | "sftp";
```

Defined in: [src/core/ProviderId.ts:45](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/core/ProviderId.ts#L45)

Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) \| `undefined` | Provider id to inspect. |

## Returns

providerId is "ftp" \| "ftps" \| "sftp"

`true` when the id is one of the classic protocol providers.
