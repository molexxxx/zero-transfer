[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshTransportConnectionOptions

# Interface: SshTransportConnectionOptions

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:38](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L38)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="abortsignal"></a> `abortSignal?` | `AbortSignal` | AbortSignal that cancels the in-flight `connect()` call and tears down the socket. | [src/protocols/ssh/transport/SshTransportConnection.ts:40](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L40) |
| <a id="algorithms"></a> `algorithms?` | [`SshAlgorithmPreferences`](SshAlgorithmPreferences.md) | Algorithm preference overrides. Defaults to the library defaults. | [src/protocols/ssh/transport/SshTransportConnection.ts:42](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L42) |
| <a id="clientsoftwareversion"></a> `clientSoftwareVersion?` | `string` | SSH software version string embedded in the identification line. | [src/protocols/ssh/transport/SshTransportConnection.ts:44](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L44) |
| <a id="handshaketimeoutms"></a> `handshakeTimeoutMs?` | `number` | Hard cap (milliseconds) on the SSH identification + key exchange + first NEWKEYS handshake. If exceeded the socket is destroyed and `connect()` rejects with a `TimeoutError`. Has no effect once `connect()` resolves. | [src/protocols/ssh/transport/SshTransportConnection.ts:50](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L50) |
| <a id="keepaliveintervalms"></a> `keepaliveIntervalMs?` | `number` | If set, sends a `SSH_MSG_IGNORE` packet every `keepaliveIntervalMs` milliseconds while the transport is connected and idle. This prevents stateful NAT / firewall devices from dropping long-lived idle sessions (e.g. between batches in a transfer queue). The timer is reset on every outbound payload, so active transfers do not generate extra traffic. | [src/protocols/ssh/transport/SshTransportConnection.ts:58](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L58) |
| <a id="verifyhostkey"></a> `verifyHostKey?` | (`input`) => `void` | Synchronous host-key policy hook invoked after the signature on the SSH exchange hash is verified. Throw to reject the server's identity. | [src/protocols/ssh/transport/SshTransportConnection.ts:63](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/transport/SshTransportConnection.ts#L63) |
