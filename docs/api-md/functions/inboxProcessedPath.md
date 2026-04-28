[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / inboxProcessedPath

# Function: inboxProcessedPath()

```ts
function inboxProcessedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:99](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/conventions.ts#L99)

Computes the absolute path used to archive successfully processed files.

## Parameters

| Parameter | Type                                                        | Description       |
| --------- | ----------------------------------------------------------- | ----------------- |
| `inbox`   | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the processed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
