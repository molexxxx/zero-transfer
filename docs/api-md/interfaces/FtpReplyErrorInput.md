[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpReplyErrorInput

# Interface: FtpReplyErrorInput

Defined in: [src/errors/errorFactory.ts:25](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L25)

Input used to map an FTP reply into a structured ZeroTransfer error.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `unknown` | Original lower-level failure that accompanied the reply. | [src/errors/errorFactory.ts:37](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L37) |
| <a id="command"></a> `command?` | `string` | FTP command that produced the response, if known. | [src/errors/errorFactory.ts:31](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L31) |
| <a id="ftpcode"></a> `ftpCode` | `number` | Numeric FTP response code returned by the server. | [src/errors/errorFactory.ts:27](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L27) |
| <a id="message"></a> `message` | `string` | Server-provided response message. | [src/errors/errorFactory.ts:29](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L29) |
| <a id="path"></a> `path?` | `string` | Remote path involved in the command, if any. | [src/errors/errorFactory.ts:33](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L33) |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol variant used by the adapter. | [src/errors/errorFactory.ts:35](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/errors/errorFactory.ts#L35) |
