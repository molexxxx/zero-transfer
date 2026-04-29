[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferErrorDetails

# Interface: ZeroTransferErrorDetails

Defined in: [src/errors/ZeroTransferError.ts:15](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L15)

Complete set of fields required to create a ZeroTransfer error.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `unknown` | Original error or exception that caused this error. | [src/errors/ZeroTransferError.ts:21](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L21) |
| <a id="code"></a> `code` | `string` | Stable machine-readable error code. | [src/errors/ZeroTransferError.ts:17](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L17) |
| <a id="command"></a> `command?` | `string` | Protocol command associated with the failure, if any. | [src/errors/ZeroTransferError.ts:27](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L27) |
| <a id="details"></a> `details?` | `Record`\<`string`, `unknown`\> | Additional structured details for diagnostics. | [src/errors/ZeroTransferError.ts:37](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L37) |
| <a id="ftpcode"></a> `ftpCode?` | `number` | FTP response code associated with the failure. | [src/errors/ZeroTransferError.ts:29](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L29) |
| <a id="host"></a> `host?` | `string` | Remote host associated with the failing operation. | [src/errors/ZeroTransferError.ts:25](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L25) |
| <a id="message"></a> `message` | `string` | Human-readable error message safe to show in logs or diagnostics. | [src/errors/ZeroTransferError.ts:19](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L19) |
| <a id="path"></a> `path?` | `string` | Remote path associated with the failure. | [src/errors/ZeroTransferError.ts:33](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L33) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol active when the error occurred. | [src/errors/ZeroTransferError.ts:23](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L23) |
| <a id="retryable"></a> `retryable` | `boolean` | Whether retry policy may safely retry this failure. | [src/errors/ZeroTransferError.ts:35](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L35) |
| <a id="sftpcode"></a> `sftpCode?` | `number` | SFTP status code associated with the failure. | [src/errors/ZeroTransferError.ts:31](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/errors/ZeroTransferError.ts#L31) |
