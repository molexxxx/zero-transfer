[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeFilter

# Type Alias: RemoteTreeFilter

```ts
type RemoteTreeFilter = (entry) => boolean;
```

Defined in: [src/sync/walkRemoteTree.ts:12](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/sync/walkRemoteTree.ts#L12)

Filter callback applied to each visited entry. Returning `false` skips the entry.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`RemoteEntry`](../interfaces/RemoteEntry.md) |

## Returns

`boolean`
