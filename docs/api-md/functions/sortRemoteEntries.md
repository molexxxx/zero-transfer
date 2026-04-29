[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / sortRemoteEntries

# Function: sortRemoteEntries()

```ts
function sortRemoteEntries(
   entries, 
   key?, 
   order?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:123](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/sync/createRemoteBrowser.ts#L123)

Returns a copy of the supplied entries sorted by the requested key. Directories
are grouped before files within ascending sorts, matching common file-manager UX.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `entries` | readonly [`RemoteEntry`](../interfaces/RemoteEntry.md)[] | `undefined` | Entries to sort. |
| `key` | [`RemoteEntrySortKey`](../type-aliases/RemoteEntrySortKey.md) | `"name"` | Sort key. |
| `order` | [`RemoteEntrySortOrder`](../type-aliases/RemoteEntrySortOrder.md) | `"asc"` | Sort order. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Sorted copy of the entries.
