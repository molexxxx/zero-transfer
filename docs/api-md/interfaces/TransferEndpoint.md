[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferEndpoint

# Interface: TransferEndpoint

Defined in: [src/transfers/TransferJob.ts:19](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L19)

Endpoint referenced by a transfer job or receipt.

## Properties

| Property                          | Type                                          | Description                                       | Defined in                                                                                                                                                    |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="path"></a> `path`          | `string`                                      | Provider, remote, or local path for the endpoint. | [src/transfers/TransferJob.ts:23](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L23) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider that owns the endpoint when known.       | [src/transfers/TransferJob.ts:21](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L21) |
