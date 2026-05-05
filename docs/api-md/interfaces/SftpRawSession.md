[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpRawSession

# Interface: SftpRawSession

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:185](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/native/sftp/NativeSftpProvider.ts#L185)

Low-level handles exposed by a native SFTP session for diagnostics and
advanced extension. Most applications should use the
[TransferSession](TransferSession.md) returned from `client.connect()` instead.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sftp"></a> `sftp` | `SftpSession` | SFTP v3 client multiplexed over the SSH session channel. | [src/providers/native/sftp/NativeSftpProvider.ts:187](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/native/sftp/NativeSftpProvider.ts#L187) |
| <a id="transport"></a> `transport` | [`SshTransportConnection`](../classes/SshTransportConnection.md) | Underlying SSH transport (key exchange, packet protection, channel mux). | [src/providers/native/sftp/NativeSftpProvider.ts:189](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/native/sftp/NativeSftpProvider.ts#L189) |
