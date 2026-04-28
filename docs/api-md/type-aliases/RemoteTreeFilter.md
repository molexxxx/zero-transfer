[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / RemoteTreeFilter

# Type Alias: RemoteTreeFilter

```ts
type RemoteTreeFilter = (entry) => boolean;
```

Defined in: [src/sync/walkRemoteTree.ts:12](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/sync/walkRemoteTree.ts#L12)

Filter callback applied to each visited entry. Returning `false` skips the entry.

## Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `entry`   | [`RemoteEntry`](../interfaces/RemoteEntry.md) |

## Returns

`boolean`
