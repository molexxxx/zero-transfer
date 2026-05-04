[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshTransportConnection

# Class: SshTransportConnection

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:91](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L91)

Live SSH transport connection over a TCP socket.

Runs the SSH identification exchange and key exchange handshake on the supplied socket,
then provides an encrypted packet send/receive interface for higher-level SSH layers
(authentication, connection, SFTP subsystem).

Usage:
```ts
const conn = new SshTransportConnection();
const result = await conn.connect(socket);        // runs handshake
conn.sendPayload(payload);                        // post-NEWKEYS send
for await (const payload of conn.receivePayloads()) { ... }
conn.disconnect();
```

## Constructors

### Constructor

```ts
new SshTransportConnection(options?): SshTransportConnection;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:108](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L108)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`SshTransportConnectionOptions`](../interfaces/SshTransportConnectionOptions.md) |

#### Returns

`SshTransportConnection`

## Methods

### connect()

```ts
connect(socket): Promise<SshTransportHandshakeResult>;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:115](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L115)

Runs the SSH handshake on a TCP-connected socket.
Resolves when NEWKEYS completes and the transport is ready for encrypted messages.
Rejects on socket error, abort, or protocol failure.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `socket` | `Socket` |

#### Returns

`Promise`\<[`SshTransportHandshakeResult`](../interfaces/SshTransportHandshakeResult.md)\>

***

### disconnect()

```ts
disconnect(reason?, description?): void;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:336](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L336)

Sends SSH_MSG_DISCONNECT and ends the socket.
Safe to call multiple times; subsequent calls are no-ops.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `reason` | [`SshDisconnectReason`](../type-aliases/SshDisconnectReason.md) | `SshDisconnectReason.BY_APPLICATION` |
| `description` | `string` | `""` |

#### Returns

`void`

***

### isConnected()

```ts
isConnected(): boolean;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:363](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L363)

#### Returns

`boolean`

***

### receivePayloads()

```ts
receivePayloads(): AsyncGenerator<Buffer<ArrayBufferLike>>;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:322](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L322)

Async generator that yields inbound SSH payloads (post-NEWKEYS).

Transparent handling:
- SSH_MSG_IGNORE (2) and SSH_MSG_DEBUG (4) are silently dropped.
- SSH_MSG_DISCONNECT (1) from the server throws a `ConnectionError`.
- Socket error or close terminates the generator.

#### Returns

`AsyncGenerator`\<`Buffer`\<`ArrayBufferLike`\>\>

***

### sendPayload()

```ts
sendPayload(payload): void;
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:306](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L306)

Sends an SSH payload over the encrypted transport.
The payload must start with the SSH message type byte.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `Buffer`\<`ArrayBufferLike`\> \| `Uint8Array`\<`ArrayBufferLike`\> |

#### Returns

`void`
