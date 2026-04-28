[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RemoteBrowser

# Interface: RemoteBrowser

Defined in: [src/sync/createRemoteBrowser.ts:58](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L58)

Stateful directory browser returned by [createRemoteBrowser](../functions/createRemoteBrowser.md).

## Properties

| Property                       | Modifier   | Type                                       | Description                          | Defined in                                                                                                                                                          |
| ------------------------------ | ---------- | ------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="entries"></a> `entries` | `readonly` | readonly [`RemoteEntry`](RemoteEntry.md)[] | Last loaded sorted/filtered entries. | [src/sync/createRemoteBrowser.ts:62](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L62) |
| <a id="path"></a> `path`       | `readonly` | `string`                                   | Current absolute path.               | [src/sync/createRemoteBrowser.ts:60](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L60) |

## Methods

### breadcrumbs()

```ts
breadcrumbs(): RemoteBreadcrumb[];
```

Defined in: [src/sync/createRemoteBrowser.ts:72](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L72)

Compute breadcrumbs for the current path without re-listing.

#### Returns

[`RemoteBreadcrumb`](RemoteBreadcrumb.md)[]

---

### navigate()

```ts
navigate(target): Promise<RemoteBrowserSnapshot>;
```

Defined in: [src/sync/createRemoteBrowser.ts:66](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L66)

Navigate to the supplied absolute or relative path.

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `target`  | `string` |

#### Returns

`Promise`\<[`RemoteBrowserSnapshot`](RemoteBrowserSnapshot.md)\>

---

### open()

```ts
open(entry): Promise<RemoteBrowserSnapshot>;
```

Defined in: [src/sync/createRemoteBrowser.ts:68](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L68)

Descend into the supplied directory entry. Throws when the entry is not a directory.

#### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `entry`   | [`RemoteEntry`](RemoteEntry.md) |

#### Returns

`Promise`\<[`RemoteBrowserSnapshot`](RemoteBrowserSnapshot.md)\>

---

### refresh()

```ts
refresh(): Promise<RemoteBrowserSnapshot>;
```

Defined in: [src/sync/createRemoteBrowser.ts:64](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L64)

Reload the current directory and return the latest snapshot.

#### Returns

`Promise`\<[`RemoteBrowserSnapshot`](RemoteBrowserSnapshot.md)\>

---

### setShowHidden()

```ts
setShowHidden(showHidden): void;
```

Defined in: [src/sync/createRemoteBrowser.ts:76](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L76)

Toggle hidden-entry visibility. The next refresh re-applies the filter.

#### Parameters

| Parameter    | Type      |
| ------------ | --------- |
| `showHidden` | `boolean` |

#### Returns

`void`

---

### setSort()

```ts
setSort(key, order?): void;
```

Defined in: [src/sync/createRemoteBrowser.ts:74](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L74)

Update the sort key. The next refresh re-sorts the cached entries.

#### Parameters

| Parameter | Type                                                              |
| --------- | ----------------------------------------------------------------- |
| `key`     | [`RemoteEntrySortKey`](../type-aliases/RemoteEntrySortKey.md)     |
| `order?`  | [`RemoteEntrySortOrder`](../type-aliases/RemoteEntrySortOrder.md) |

#### Returns

`void`

---

### up()

```ts
up(): Promise<RemoteBrowserSnapshot>;
```

Defined in: [src/sync/createRemoteBrowser.ts:70](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L70)

Move to the parent directory; no-op when already at the root.

#### Returns

`Promise`\<[`RemoteBrowserSnapshot`](RemoteBrowserSnapshot.md)\>
