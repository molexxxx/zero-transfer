[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FriendlyTransferOptions

# Type Alias: FriendlyTransferOptions

```ts
type FriendlyTransferOptions = Omit<RunRouteOptions, "client" | "route"> & {
  routeId?: string;
  routeName?: string;
};
```

Defined in: [src/client/operations.ts:28](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/client/operations.ts#L28)

Shared options consumed by [uploadFile](../functions/uploadFile.md), [downloadFile](../functions/downloadFile.md), and [copyBetween](../functions/copyBetween.md).

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `routeId?` | `string` | Stable route id assigned to the synthetic route. Defaults to `"upload:..."`, `"download:..."`, or `"copy:..."`. | [src/client/operations.ts:30](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/client/operations.ts#L30) |
| `routeName?` | `string` | Optional human-readable route name forwarded to telemetry. | [src/client/operations.ts:32](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/client/operations.ts#L32) |
