[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / filterRemoteEntries

# Function: filterRemoteEntries()

```ts
function filterRemoteEntries(entries, options?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:149](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/createRemoteBrowser.ts#L149)

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
