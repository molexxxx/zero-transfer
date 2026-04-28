[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / inboxFailedPath

# Function: inboxFailedPath()

```ts
function inboxFailedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:109](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L109)

Computes the absolute path used to quarantine failed files.

## Parameters

| Parameter | Type                                                        | Description       |
| --------- | ----------------------------------------------------------- | ----------------- |
| `inbox`   | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the failed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
