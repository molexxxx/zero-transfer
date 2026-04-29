[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / filterRemoteEntries

# Function: filterRemoteEntries()

```ts
function filterRemoteEntries(entries, options?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:149](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/sync/createRemoteBrowser.ts#L149)

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
