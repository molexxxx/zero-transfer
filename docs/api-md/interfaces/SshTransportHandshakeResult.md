[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshTransportHandshakeResult

# Interface: SshTransportHandshakeResult

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:29](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L29)

Initial client-side handshake state before key exchange math starts.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="inboundpacketcount"></a> `inboundPacketCount` | `number` | Number of unencrypted packets the client received from the server during the handshake (server KEXINIT, KEX_ECDH_REPLY, NEWKEYS). Seeds the inbound unprotector. | [src/protocols/ssh/transport/SshTransportHandshake.ts:59](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L59) |
| <a id="keyexchange"></a> `keyExchange` | \{ `algorithm`: `string`; `clientKexInitPayload`: `Buffer`; `clientPublicKey`: `Buffer`; `exchangeHash`: `Buffer`; `serverHostKey`: `Buffer`; `serverKexInitPayload`: `Buffer`; `serverPublicKey`: `Buffer`; `serverSignature`: `Buffer`; `sessionId`: `Buffer`; `sharedSecret`: `Buffer`; `transportKeys`: \{ `clientToServer`: `SshTransportDirectionKeys`; `serverToClient`: `SshTransportDirectionKeys`; \}; \} | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:30](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L30) |
| `keyExchange.algorithm` | `string` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:31](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L31) |
| `keyExchange.clientKexInitPayload` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:32](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L32) |
| `keyExchange.clientPublicKey` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:33](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L33) |
| `keyExchange.exchangeHash` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:34](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L34) |
| `keyExchange.serverHostKey` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:35](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L35) |
| `keyExchange.serverKexInitPayload` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:36](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L36) |
| `keyExchange.serverPublicKey` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:37](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L37) |
| `keyExchange.serverSignature` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:38](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L38) |
| `keyExchange.sessionId` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:39](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L39) |
| `keyExchange.sharedSecret` | `Buffer` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:40](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L40) |
| `keyExchange.transportKeys` | \{ `clientToServer`: `SshTransportDirectionKeys`; `serverToClient`: `SshTransportDirectionKeys`; \} | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:41](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L41) |
| `keyExchange.transportKeys.clientToServer` | `SshTransportDirectionKeys` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:42](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L42) |
| `keyExchange.transportKeys.serverToClient` | `SshTransportDirectionKeys` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:43](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L43) |
| <a id="negotiatedalgorithms"></a> `negotiatedAlgorithms` | [`NegotiatedSshAlgorithms`](NegotiatedSshAlgorithms.md) | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:46](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L46) |
| <a id="outboundpacketcount"></a> `outboundPacketCount` | `number` | Number of unencrypted packets the client sent during the handshake (KEXINIT, KEX_ECDH_INIT, NEWKEYS). Per RFC 4253 §6.4, packet sequence numbers are never reset across NEWKEYS, so this value seeds the outbound protector. | [src/protocols/ssh/transport/SshTransportHandshake.ts:54](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L54) |
| <a id="serveridentification"></a> `serverIdentification` | `SshIdentification` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:47](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L47) |
| <a id="serverkexinit"></a> `serverKexInit` | `SshKexInitMessage` | - | [src/protocols/ssh/transport/SshTransportHandshake.ts:48](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportHandshake.ts#L48) |
