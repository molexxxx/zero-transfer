[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRouteFilter

# Interface: MftRouteFilter

Defined in: [src/mft/MftRoute.ts:23](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/MftRoute.ts#L23)

Optional filter metadata reserved for tree-aware route execution.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="exclude"></a> `exclude?` | readonly `string`[] | Glob patterns whose matches should be excluded. | [src/mft/MftRoute.ts:27](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/MftRoute.ts#L27) |
| <a id="include"></a> `include?` | readonly `string`[] | Glob patterns whose matches should be included. | [src/mft/MftRoute.ts:25](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/MftRoute.ts#L25) |
