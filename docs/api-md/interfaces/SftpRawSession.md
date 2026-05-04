[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpRawSession

# Interface: SftpRawSession

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:168](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L168)

Low-level handles exposed by a native SFTP session for diagnostics and
advanced extension. Most applications should use the
[TransferSession](TransferSession.md) returned from `client.connect()` instead.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sftp"></a> `sftp` | `SftpSession` | SFTP v3 client multiplexed over the SSH session channel. | [src/providers/native/sftp/NativeSftpProvider.ts:170](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L170) |
| <a id="transport"></a> `transport` | `SshTransportConnection` | Underlying SSH transport (key exchange, packet protection, channel mux). | [src/providers/native/sftp/NativeSftpProvider.ts:172](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L172) |
