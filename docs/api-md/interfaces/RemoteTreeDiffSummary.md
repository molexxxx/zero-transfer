[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RemoteTreeDiffSummary

# Interface: RemoteTreeDiffSummary

Defined in: [src/sync/diffRemoteTrees.ts:36](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L36)

Compact summary of a diff result.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="added"></a> `added` | `number` | Number of entries present only on the source side. | [src/sync/diffRemoteTrees.ts:38](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L38) |
| <a id="modified"></a> `modified` | `number` | Number of entries present on both sides whose contents differ. | [src/sync/diffRemoteTrees.ts:42](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L42) |
| <a id="removed"></a> `removed` | `number` | Number of entries present only on the destination side. | [src/sync/diffRemoteTrees.ts:40](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L40) |
| <a id="total"></a> `total` | `number` | Total entries inspected across both sides. | [src/sync/diffRemoteTrees.ts:46](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L46) |
| <a id="unchanged"></a> `unchanged` | `number` | Number of entries present on both sides with identical contents. | [src/sync/diffRemoteTrees.ts:44](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/sync/diffRemoteTrees.ts#L44) |
