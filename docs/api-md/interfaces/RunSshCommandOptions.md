[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RunSshCommandOptions

# Interface: RunSshCommandOptions

Defined in: [src/protocols/ssh/runSshCommand.ts:19](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L19)

Options for [runSshCommand](../functions/runSshCommand.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="auth"></a> `auth` | `SshCredential` | Authentication credential. Use one of: - `{ type: "password", username, password }` - `{ type: "publickey", username, algorithmName, publicKeyBlob, sign }` (build one from a private-key file with `buildPublickeyCredential`) - `{ type: "keyboard-interactive", username, respond }` | [src/protocols/ssh/runSshCommand.ts:34](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L34) |
| <a id="command"></a> `command` | `string` | Command to execute on the remote shell. | [src/protocols/ssh/runSshCommand.ts:25](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L25) |
| <a id="connecttimeoutms"></a> `connectTimeoutMs?` | `number` | TCP connect timeout in milliseconds. Defaults to 10 000. | [src/protocols/ssh/runSshCommand.ts:42](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L42) |
| <a id="host"></a> `host` | `string` | Hostname or IP of the SSH server. | [src/protocols/ssh/runSshCommand.ts:21](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L21) |
| <a id="maxoutputbytes"></a> `maxOutputBytes?` | `number` | Maximum total bytes captured from stdout. Defaults to 16 MiB. | [src/protocols/ssh/runSshCommand.ts:44](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L44) |
| <a id="port"></a> `port?` | `number` | TCP port. Defaults to `22`. | [src/protocols/ssh/runSshCommand.ts:23](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L23) |
| <a id="transport"></a> `transport?` | [`SshTransportConnectionOptions`](SshTransportConnectionOptions.md) | Forwarded to [SshTransportConnection](../classes/SshTransportConnection.md); covers host-key pinning, algorithm overrides, and handshake timeout. The default `handshakeTimeoutMs` is 10 seconds. | [src/protocols/ssh/runSshCommand.ts:40](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/runSshCommand.ts#L40) |
