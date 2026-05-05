[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshConnectionManager

# Class: SshConnectionManager

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:44](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L44)

## Constructors

### Constructor

```ts
new SshConnectionManager(transport): SshConnectionManager;
```

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:55](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L55)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transport` | [`SshTransportConnection`](SshTransportConnection.md) |

#### Returns

`SshConnectionManager`

## Methods

### nextSetupPayload()

```ts
nextSetupPayload(): Promise<Buffer<ArrayBufferLike>>;
```

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:66](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L66)

Delivers the next connection-layer payload to callers during channel setup.
Called by `SshSessionChannel` during `openChannel()` / `requestSubsystem()`.

Channel setup happens sequentially before `start()` begins pumping, so we
pull directly from the transport iterator here.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

***

### openExecChannel()

```ts
openExecChannel(command): Promise<SshSessionChannel>;
```

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:103](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L103)

Opens a session channel and runs the given command on it.
Must be called before `start()`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `command` | `string` |

#### Returns

`Promise`\<[`SshSessionChannel`](SshSessionChannel.md)\>

***

### openSubsystemChannel()

```ts
openSubsystemChannel(subsystemName): Promise<SshSessionChannel>;
```

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:89](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L89)

Opens a session channel and starts the SFTP subsystem on it.
Must be called before `start()`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `subsystemName` | `string` |

#### Returns

`Promise`\<[`SshSessionChannel`](SshSessionChannel.md)\>

***

### start()

```ts
start(): Promise<void>;
```

Defined in: [src/protocols/ssh/connection/SshConnectionManager.ts:120](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/connection/SshConnectionManager.ts#L120)

Starts the main dispatch loop.  Returns a Promise that resolves when the
connection closes cleanly, or rejects on a fatal transport error.

Call this after all channels have been opened and the application is ready
to receive data.

#### Returns

`Promise`\<`void`\>
