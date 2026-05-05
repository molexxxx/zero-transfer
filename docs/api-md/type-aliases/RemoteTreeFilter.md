[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeFilter

# Type Alias: RemoteTreeFilter

```ts
type RemoteTreeFilter = (entry) => boolean;
```

Defined in: [src/sync/walkRemoteTree.ts:12](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/sync/walkRemoteTree.ts#L12)

Filter callback applied to each visited entry. Returning `false` skips the entry.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`RemoteEntry`](../interfaces/RemoteEntry.md) |

## Returns

`boolean`
