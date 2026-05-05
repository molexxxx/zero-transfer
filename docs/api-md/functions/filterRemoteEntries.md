[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / filterRemoteEntries

# Function: filterRemoteEntries()

```ts
function filterRemoteEntries(entries, options?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:149](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/sync/createRemoteBrowser.ts#L149)

Filters entries using the optional predicate plus an optional hidden-file rule.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `entries` | readonly [`RemoteEntry`](../interfaces/RemoteEntry.md)[] | Entries to filter. |
| `options` | \{ `filter?`: [`RemoteBrowserFilter`](../type-aliases/RemoteBrowserFilter.md); `showHidden?`: `boolean`; \} | Filtering controls. |
| `options.filter?` | [`RemoteBrowserFilter`](../type-aliases/RemoteBrowserFilter.md) | - |
| `options.showHidden?` | `boolean` | - |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Entries matching the supplied rules.
