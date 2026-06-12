[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpRawSession

# Interface: SftpRawSession

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:199](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L199)

Low-level handles exposed by a native SFTP session for diagnostics and
advanced extension. Most applications should use the
[TransferSession](TransferSession.md) returned from `client.connect()` instead.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sftp"></a> `sftp` | `SftpSession` | SFTP v3 client multiplexed over the SSH session channel. | [src/providers/native/sftp/NativeSftpProvider.ts:201](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L201) |
| <a id="transport"></a> `transport` | [`SshTransportConnection`](../classes/SshTransportConnection.md) | Underlying SSH transport (key exchange, packet protection, channel mux). | [src/providers/native/sftp/NativeSftpProvider.ts:203](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L203) |
