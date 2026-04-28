[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / sortRemoteEntries

# Function: sortRemoteEntries()

```ts
function sortRemoteEntries(entries, key?, order?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:123](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L123)

Returns a copy of the supplied entries sorted by the requested key. Directories
are grouped before files within ascending sorts, matching common file-manager UX.

## Parameters

| Parameter | Type                                                              | Default value | Description      |
| --------- | ----------------------------------------------------------------- | ------------- | ---------------- |
| `entries` | readonly [`RemoteEntry`](../interfaces/RemoteEntry.md)[]          | `undefined`   | Entries to sort. |
| `key`     | [`RemoteEntrySortKey`](../type-aliases/RemoteEntrySortKey.md)     | `"name"`      | Sort key.        |
| `order`   | [`RemoteEntrySortOrder`](../type-aliases/RemoteEntrySortOrder.md) | `"asc"`       | Sort order.      |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Sorted copy of the entries.
