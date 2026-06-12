[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSessionChannel

# Class: SshSessionChannel

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:70](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L70)

A single SSH session channel.
Not safe to share across concurrent callers; each SftpSession should own one.

## Constructors

### Constructor

```ts
new SshSessionChannel(transport, options?): SshSessionChannel;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:100](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L100)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transport` | [`SshTransportConnection`](SshTransportConnection.md) |
| `options` | `SshSessionChannelOptions` |

#### Returns

`SshSessionChannel`

## Methods

### close()

```ts
close(): void;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:282](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L282)

Sends EOF and CLOSE.  Should be called when the client is done sending.

#### Returns

`void`

***

### dispatch()

```ts
dispatch(payload): void;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:295](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L295)

Feed an inbound transport payload to this channel.
Called by the channel multiplexer (`SshConnectionManager`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `Buffer` |

#### Returns

`void`

***

### dispatchError()

```ts
dispatchError(error): void;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:343](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L343)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `Error` |

#### Returns

`void`

***

### openExec()

```ts
openExec(command): Promise<void>;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:121](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L121)

Opens the channel and executes a command.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `command` | `string` |

#### Returns

`Promise`\<`void`\>

***

### openSubsystem()

```ts
openSubsystem(subsystemName): Promise<void>;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:113](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L113)

Opens the channel and requests a subsystem.
Resolves once the server confirms both CHANNEL_OPEN and the subsystem request.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `subsystemName` | `string` |

#### Returns

`Promise`\<`void`\>

***

### receiveData()

```ts
receiveData(): AsyncGenerator<Buffer<ArrayBufferLike>, void, undefined>;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:268](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L268)

Async generator that yields raw data buffers from the channel.
Returns (done) when the channel receives EOF or CLOSE.

#### Returns

`AsyncGenerator`\<`Buffer`\<`ArrayBufferLike`\>, `void`, `undefined`\>

***

### sendData()

```ts
sendData(data): Promise<void>;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:221](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/protocols/ssh/connection/SshSessionChannel.ts#L221)

Sends data on the channel. Respects the remote window; if there is no space,
splits the data and queues the remainder for when WINDOW_ADJUST arrives.

Concurrent calls are serialized so wire byte order matches call order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Uint8Array` |

#### Returns

`Promise`\<`void`\>
