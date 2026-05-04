[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpRawSession

# Interface: SftpRawSession

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:168](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/native/sftp/NativeSftpProvider.ts#L168)

Low-level handles exposed by a native SFTP session for diagnostics and
advanced extension. Most applications should use the
[TransferSession](TransferSession.md) returned from `client.connect()` instead.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sftp"></a> `sftp` | `SftpSession` | SFTP v3 client multiplexed over the SSH session channel. | [src/providers/native/sftp/NativeSftpProvider.ts:170](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/native/sftp/NativeSftpProvider.ts#L170) |
| <a id="transport"></a> `transport` | `SshTransportConnection` | Underlying SSH transport (key exchange, packet protection, channel mux). | [src/providers/native/sftp/NativeSftpProvider.ts:172](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/providers/native/sftp/NativeSftpProvider.ts#L172) |
