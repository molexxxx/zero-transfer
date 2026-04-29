[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferOptions

# Interface: ZeroTransferOptions

Defined in: [src/client/ZeroTransfer.ts:33](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/client/ZeroTransfer.ts#L33)

Construction options for a [ZeroTransfer](../classes/ZeroTransfer.md) instance.

## Remarks

The adapter option is primarily used by protocol implementations and tests. Until
the built-in FTP, FTPS, and SFTP adapters are implemented, callers can inject a
compatible adapter to exercise the facade contract.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="adapter"></a> `adapter?` | [`RemoteFileAdapter`](RemoteFileAdapter.md) | Protocol adapter that performs concrete remote file operations. | [src/client/ZeroTransfer.ts:39](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/client/ZeroTransfer.ts#L39) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Structured logger used for lifecycle and operation records. | [src/client/ZeroTransfer.ts:37](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/client/ZeroTransfer.ts#L37) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol used when the connection profile does not provide one. | [src/client/ZeroTransfer.ts:35](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/client/ZeroTransfer.ts#L35) |
