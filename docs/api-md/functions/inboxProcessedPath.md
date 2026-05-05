[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / inboxProcessedPath

# Function: inboxProcessedPath()

```ts
function inboxProcessedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:99](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L99)

Computes the absolute path used to archive successfully processed files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inbox` | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the processed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
