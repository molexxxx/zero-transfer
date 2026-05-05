[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RunSshCommandResult

# Interface: RunSshCommandResult

Defined in: [src/protocols/ssh/runSshCommand.ts:55](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/runSshCommand.ts#L55)

Result of [runSshCommand](../functions/runSshCommand.md). The full captured stdout is provided as
both a `Buffer` (for binary output) and as a UTF-8 decoded `string`.

Note: stderr (CHANNEL_EXTENDED_DATA) and exit-status are not currently
surfaced - drop down to [SshConnectionManager](../classes/SshConnectionManager.md)/[SshSessionChannel](../classes/SshSessionChannel.md)
directly if you need them.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytesreceived"></a> `bytesReceived` | `number` | Bytes received before the channel closed. | [src/protocols/ssh/runSshCommand.ts:61](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/runSshCommand.ts#L61) |
| <a id="stdout"></a> `stdout` | `Buffer` | Captured stdout as raw bytes. | [src/protocols/ssh/runSshCommand.ts:57](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/runSshCommand.ts#L57) |
| <a id="stdouttext"></a> `stdoutText` | `string` | Captured stdout decoded as UTF-8. | [src/protocols/ssh/runSshCommand.ts:59](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/runSshCommand.ts#L59) |
