[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / inboxFailedPath

# Function: inboxFailedPath()

```ts
function inboxFailedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:109](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/conventions.ts#L109)

Computes the absolute path used to quarantine failed files.

## Parameters

| Parameter | Type                                                        | Description       |
| --------- | ----------------------------------------------------------- | ----------------- |
| `inbox`   | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the failed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
