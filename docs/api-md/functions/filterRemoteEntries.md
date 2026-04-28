[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / filterRemoteEntries

# Function: filterRemoteEntries()

```ts
function filterRemoteEntries(entries, options?): RemoteEntry[];
```

Defined in: [src/sync/createRemoteBrowser.ts:149](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L149)

Filters entries using the optional predicate plus an optional hidden-file rule.

## Parameters

| Parameter             | Type                                                                                                        | Description         |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------- |
| `entries`             | readonly [`RemoteEntry`](../interfaces/RemoteEntry.md)[]                                                    | Entries to filter.  |
| `options`             | \{ `filter?`: [`RemoteBrowserFilter`](../type-aliases/RemoteBrowserFilter.md); `showHidden?`: `boolean`; \} | Filtering controls. |
| `options.filter?`     | [`RemoteBrowserFilter`](../type-aliases/RemoteBrowserFilter.md)                                             | -                   |
| `options.showHidden?` | `boolean`                                                                                                   | -                   |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Entries matching the supplied rules.
