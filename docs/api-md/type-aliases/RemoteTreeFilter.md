[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RemoteTreeFilter

# Type Alias: RemoteTreeFilter

```ts
type RemoteTreeFilter = (entry) => boolean;
```

Defined in: [src/sync/walkRemoteTree.ts:12](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/walkRemoteTree.ts#L12)

Filter callback applied to each visited entry. Returning `false` skips the entry.

## Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `entry`   | [`RemoteEntry`](../interfaces/RemoteEntry.md) |

## Returns

`boolean`
