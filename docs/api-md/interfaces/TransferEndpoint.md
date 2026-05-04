[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferEndpoint

# Interface: TransferEndpoint

Defined in: [src/transfers/TransferJob.ts:19](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L19)

Endpoint referenced by a transfer job or receipt.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="path"></a> `path` | `string` | Provider, remote, or local path for the endpoint. | [src/transfers/TransferJob.ts:23](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L23) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider that owns the endpoint when known. | [src/transfers/TransferJob.ts:21](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferJob.ts#L21) |
