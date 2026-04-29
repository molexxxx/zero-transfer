[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / inboxProcessedPath

# Function: inboxProcessedPath()

```ts
function inboxProcessedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:99](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/conventions.ts#L99)

Computes the absolute path used to archive successfully processed files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inbox` | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the processed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
