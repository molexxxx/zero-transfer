[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshAuthSession

# Class: SshAuthSession

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:98](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/auth/SshAuthSession.ts#L98)

Runs SSH user authentication over an encrypted transport connection.

Call this after `SshTransportConnection.connect()` completes.
Returns a generator of inbound payloads for the upper (connection) layer to consume.
Resolves with an `SshAuthResult` on success; throws `AuthenticationError` on failure.

## Constructors

### Constructor

```ts
new SshAuthSession(transport): SshAuthSession;
```

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:99](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/auth/SshAuthSession.ts#L99)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transport` | [`SshTransportConnection`](SshTransportConnection.md) |

#### Returns

`SshAuthSession`

## Methods

### authenticate()

```ts
authenticate(options): Promise<SshAuthResult>;
```

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:101](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/auth/SshAuthSession.ts#L101)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `SshAuthOptions` |

#### Returns

`Promise`\<`SshAuthResult`\>
