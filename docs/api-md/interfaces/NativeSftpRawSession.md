[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / NativeSftpRawSession

# Interface: NativeSftpRawSession

Defined in: src/providers/native/sftp/NativeSftpProvider.ts:167

Low-level handles exposed by a native SFTP session for diagnostics and
advanced extension. Most applications should use the
[TransferSession](TransferSession.md) returned from `client.connect()` instead.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sftp"></a> `sftp` | `SftpSession` | SFTP v3 client multiplexed over the SSH session channel. | src/providers/native/sftp/NativeSftpProvider.ts:169 |
| <a id="transport"></a> `transport` | `SshTransportConnection` | Underlying SSH transport (key exchange, packet protection, channel mux). | src/providers/native/sftp/NativeSftpProvider.ts:171 |
