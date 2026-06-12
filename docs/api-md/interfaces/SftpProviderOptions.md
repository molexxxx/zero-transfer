[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpProviderOptions

# Interface: SftpProviderOptions

Defined in: [src/providers/native/sftp/NativeSftpProvider.ts:158](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L158)

Options for [createSftpProviderFactory](../functions/createSftpProviderFactory.md).

The native provider is a zero-dependency replacement for the legacy
`ssh2`-backed provider. It implements RFC 4253 SSH transport, RFC 4252 user
authentication (`password`, `keyboard-interactive`, `publickey` with
Ed25519/RSA), RFC 5656 ECDSA host keys (`nistp256/384/521`), and the
SFTP v3 client protocol multiplexed over a single channel.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keepaliveintervalms"></a> `keepaliveIntervalMs?` | `number` | Default interval (milliseconds) between SSH-level keepalive pings sent once the transport is connected and idle. Prevents stateful firewalls / NAT devices from dropping long-lived sessions. The timer is reset on every outbound payload so active transfers do not generate extra traffic. Disabled when omitted or `0`. | [src/providers/native/sftp/NativeSftpProvider.ts:173](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L173) |
| <a id="maxconcurrency"></a> `maxConcurrency?` | `number` | Maximum concurrent file-transfer operations the engine should schedule against a single SFTP session. Each in-flight read/write occupies an outstanding SFTP request slot multiplexed over the same SSH channel; the default of `8` keeps memory bounded on commodity servers, but high-RTT links and modern OpenSSH builds can comfortably handle 16\u201364. Must be a positive integer. | [src/providers/native/sftp/NativeSftpProvider.ts:182](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L182) |
| <a id="pipeline"></a> `pipeline?` | [`SftpPipelineOptions`](SftpPipelineOptions.md) | Pipelined transfer tuning. Single-file reads and writes keep a sliding window of outstanding SFTP requests in flight (default 64 requests x 32 KiB = 2 MiB, matching the OpenSSH client), which hides per-request round trips and saturates high-latency links. Set `pipeline: { maxInFlight: 1 }` to reproduce the serial one-request-at-a-time behavior. | [src/providers/native/sftp/NativeSftpProvider.ts:191](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L191) |
| <a id="readytimeoutms"></a> `readyTimeoutMs?` | `number` | Default connection timeout in milliseconds when the profile omits `timeoutMs`. Bounds both the TCP connect *and* the SSH identification + key-exchange handshake, so a hung server cannot stall `connect()` indefinitely after the socket is accepted. | [src/providers/native/sftp/NativeSftpProvider.ts:165](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/native/sftp/NativeSftpProvider.ts#L165) |
