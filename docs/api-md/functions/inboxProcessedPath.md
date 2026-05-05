[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / inboxProcessedPath

# Function: inboxProcessedPath()

```ts
function inboxProcessedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:99](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/conventions.ts#L99)

Computes the absolute path used to archive successfully processed files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inbox` | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the processed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
