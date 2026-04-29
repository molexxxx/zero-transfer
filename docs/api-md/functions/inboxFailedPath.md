[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / inboxFailedPath

# Function: inboxFailedPath()

```ts
function inboxFailedPath(inbox): string;
```

Defined in: [src/mft/conventions.ts:109](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/conventions.ts#L109)

Computes the absolute path used to quarantine failed files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inbox` | [`MftInboxConvention`](../interfaces/MftInboxConvention.md) | Inbox convention. |

## Returns

`string`

Absolute path to the failed subdirectory under [MftInboxConvention.basePath](../interfaces/MftInboxConvention.md#basepath).
