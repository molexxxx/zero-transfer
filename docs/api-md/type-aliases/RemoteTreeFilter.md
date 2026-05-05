[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeFilter

# Type Alias: RemoteTreeFilter

```ts
type RemoteTreeFilter = (entry) => boolean;
```

Defined in: [src/sync/walkRemoteTree.ts:12](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/sync/walkRemoteTree.ts#L12)

Filter callback applied to each visited entry. Returning `false` skips the entry.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`RemoteEntry`](../interfaces/RemoteEntry.md) |

## Returns

`boolean`
