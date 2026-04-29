[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / filterRemoteEntries

# Function: filterRemoteEntries()

```ts
function filterRemoteEntries(entries, options?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:149](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/createRemoteBrowser.ts#L149)

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
