[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSessionChannel

# Class: SshSessionChannel

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:67](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L67)

A single SSH session channel.
Not safe to share across concurrent callers; each SftpSession should own one.

## Constructors

### Constructor

```ts
new SshSessionChannel(transport, options?): SshSessionChannel;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:97](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L97)

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

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:279](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L279)

Sends EOF and CLOSE.  Should be called when the client is done sending.

#### Returns

`void`

***

### dispatch()

```ts
dispatch(payload): void;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:292](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L292)

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

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:340](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L340)

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

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:118](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L118)

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

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:110](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L110)

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

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:265](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L265)

Async generator that yields raw data buffers from the channel.
Returns (done) when the channel receives EOF or CLOSE.

#### Returns

`AsyncGenerator`\<`Buffer`\<`ArrayBufferLike`\>, `void`, `undefined`\>

***

### sendData()

```ts
sendData(data): Promise<void>;
```

Defined in: [src/protocols/ssh/connection/SshSessionChannel.ts:218](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/connection/SshSessionChannel.ts#L218)

Sends data on the channel. Respects the remote window; if there is no space,
splits the data and queues the remainder for when WINDOW_ADJUST arrives.

Concurrent calls are serialized so wire byte order matches call order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Uint8Array` |

#### Returns

`Promise`\<`void`\>
