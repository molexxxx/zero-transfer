[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshTransportHandshake

# Class: SshTransportHandshake

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:72](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L72)

Client-side SSH handshake coordinator for version exchange and KEXINIT negotiation.

## Constructors

### Constructor

```ts
new SshTransportHandshake(options?): SshTransportHandshake;
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:105](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L105)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `algorithms?`: [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md); `clientComments?`: `string`; `clientSoftwareVersion?`: `string`; `kexCookie?`: `Uint8Array`\<`ArrayBufferLike`\>; `verifyHostKey?`: (`input`) => `void` \| `Promise`\<`void`\>; \} | - |
| `options.algorithms?` | [`SshAlgorithmPreferences`](../interfaces/SshAlgorithmPreferences.md) | - |
| `options.clientComments?` | `string` | - |
| `options.clientSoftwareVersion?` | `string` | - |
| `options.kexCookie?` | `Uint8Array`\<`ArrayBufferLike`\> | - |
| `options.verifyHostKey?` | (`input`) => `void` \| `Promise`\<`void`\> | Verifies the server's host key after the signature check passes. Receives the SSH wire-format host key blob and its SHA-256 digest. Throwing rejects the handshake; resolving accepts it. If omitted, the host key is accepted as long as its signature over the exchange hash verifies. Callers SHOULD supply this hook in production to enforce known_hosts or pinned-fingerprint policies. |

#### Returns

`SshTransportHandshake`

## Methods

### createInitialClientBytes()

```ts
createInitialClientBytes(): Buffer;
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:139](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L139)

Creates the first outbound bytes (client identification line).

#### Returns

`Buffer`

***

### getServerBannerLines()

```ts
getServerBannerLines(): readonly string[];
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:175](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L175)

#### Returns

readonly `string`[]

***

### isComplete()

```ts
isComplete(): boolean;
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:179](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L179)

#### Returns

`boolean`

***

### pushServerBytes()

```ts
pushServerBytes(chunk): {
  outbound: Buffer<ArrayBufferLike>[];
  result?: SshTransportHandshakeResult;
};
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:146](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L146)

Feeds raw server bytes into the handshake state machine.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chunk` | `Uint8Array` |

#### Returns

```ts
{
  outbound: Buffer<ArrayBufferLike>[];
  result?: SshTransportHandshakeResult;
}
```

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `outbound` | `Buffer`\<`ArrayBufferLike`\>[] | [src/protocols/ssh/transport/SshTransportHandshake.ts:147](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L147) |
| `result?` | [`SshTransportHandshakeResult`](../interfaces/SshTransportHandshakeResult.md) | [src/protocols/ssh/transport/SshTransportHandshake.ts:148](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L148) |

***

### takeRemainingBytes()

```ts
takeRemainingBytes(): Buffer;
```

Defined in: [src/protocols/ssh/transport/SshTransportHandshake.ts:188](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/transport/SshTransportHandshake.ts#L188)

Returns any bytes received after the last complete handshake packet and clears the buffer.
Call this once after `pushServerBytes` returns a result to drain bytes that belong to the
post-NEWKEYS encrypted phase but arrived in the same TCP segment as NEWKEYS.

#### Returns

`Buffer`
