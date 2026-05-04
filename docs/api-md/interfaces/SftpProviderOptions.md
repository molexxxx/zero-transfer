[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpProviderOptions

# Interface: SftpProviderOptions

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:145](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L145)

Options for [createNativeSftpProviderFactory](../functions/createSftpProviderFactory.md).

The native provider is a zero-dependency replacement for the legacy
`ssh2`-backed provider. It implements RFC 4253 SSH transport, RFC 4252 user
authentication (`password`, `keyboard-interactive`, `publickey` with
Ed25519/RSA), RFC 5656 ECDSA host keys (`nistp256/384/521`), and the
SFTP v3 client protocol multiplexed over a single channel.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keepaliveintervalms"></a> `keepaliveIntervalMs?` | `number` | Default interval (milliseconds) between SSH-level keepalive pings sent once the transport is connected and idle. Prevents stateful firewalls / NAT devices from dropping long-lived sessions. The timer is reset on every outbound payload so active transfers do not generate extra traffic. Disabled when omitted or `0`. | [src/providers/native/sftp/NativeSftpProvider.ts:160](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L160) |
| <a id="readytimeoutms"></a> `readyTimeoutMs?` | `number` | Default connection timeout in milliseconds when the profile omits `timeoutMs`. Bounds both the TCP connect *and* the SSH identification + key-exchange handshake, so a hung server cannot stall `connect()` indefinitely after the socket is accepted. | [src/providers/native/sftp/NativeSftpProvider.ts:152](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/native/sftp/NativeSftpProvider.ts#L152) |
