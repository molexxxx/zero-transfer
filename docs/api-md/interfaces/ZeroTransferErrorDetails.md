[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferErrorDetails

# Interface: ZeroTransferErrorDetails

Defined in: [src/errors/ZeroTransferError.ts:16](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L16)

Complete set of fields required to create a ZeroTransfer error.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `unknown` | Original error or exception that caused this error. | [src/errors/ZeroTransferError.ts:22](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L22) |
| <a id="code"></a> `code` | `string` | Stable machine-readable error code. | [src/errors/ZeroTransferError.ts:18](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L18) |
| <a id="command"></a> `command?` | `string` | Protocol command associated with the failure, if any. | [src/errors/ZeroTransferError.ts:28](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L28) |
| <a id="details"></a> `details?` | `Record`\<`string`, `unknown`\> | Additional structured details for diagnostics. | [src/errors/ZeroTransferError.ts:38](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L38) |
| <a id="ftpcode"></a> `ftpCode?` | `number` | FTP response code associated with the failure. | [src/errors/ZeroTransferError.ts:30](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L30) |
| <a id="host"></a> `host?` | `string` | Remote host associated with the failing operation. | [src/errors/ZeroTransferError.ts:26](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L26) |
| <a id="message"></a> `message` | `string` | Human-readable error message safe to show in logs or diagnostics. | [src/errors/ZeroTransferError.ts:20](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L20) |
| <a id="path"></a> `path?` | `string` | Remote path associated with the failure. | [src/errors/ZeroTransferError.ts:34](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L34) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol active when the error occurred. | [src/errors/ZeroTransferError.ts:24](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L24) |
| <a id="retryable"></a> `retryable` | `boolean` | Whether retry policy may safely retry this failure. | [src/errors/ZeroTransferError.ts:36](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L36) |
| <a id="sftpcode"></a> `sftpCode?` | `number` | SFTP status code associated with the failure. | [src/errors/ZeroTransferError.ts:32](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L32) |
