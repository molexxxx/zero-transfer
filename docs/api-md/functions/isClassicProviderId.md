[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / isClassicProviderId

# Function: isClassicProviderId()

```ts
function isClassicProviderId(providerId): providerId is "ftp" | "ftps" | "sftp";
```

Defined in: [src/core/ProviderId.ts:45](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/core/ProviderId.ts#L45)

Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family.

## Parameters

| Parameter    | Type                                                         | Description             |
| ------------ | ------------------------------------------------------------ | ----------------------- |
| `providerId` | [`ProviderId`](../type-aliases/ProviderId.md) \| `undefined` | Provider id to inspect. |

## Returns

providerId is "ftp" \| "ftps" \| "sftp"

`true` when the id is one of the classic protocol providers.
