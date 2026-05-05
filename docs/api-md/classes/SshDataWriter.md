[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshDataWriter

# Class: SshDataWriter

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:10](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L10)

Minimal SSH primitive encoder for transport and authentication packets.

## Constructors

### Constructor

```ts
new SshDataWriter(): SshDataWriter;
```

#### Returns

`SshDataWriter`

## Methods

### toBuffer()

```ts
toBuffer(): Buffer;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:83](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L83)

#### Returns

`Buffer`

***

### writeBoolean()

```ts
writeBoolean(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:21](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L21)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `boolean` |

#### Returns

`this`

***

### writeByte()

```ts
writeByte(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:14](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `number` |

#### Returns

`this`

***

### writeBytes()

```ts
writeBytes(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:25](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L25)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Uint8Array` |

#### Returns

`this`

***

### writeMpint()

```ts
writeMpint(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:63](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L63)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Uint8Array` |

#### Returns

`this`

***

### writeNameList()

```ts
writeNameList(values): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:69](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L69)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `values` | readonly `string`[] |

#### Returns

`this`

***

### writeString()

```ts
writeString(value, encoding?): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:57](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L57)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `value` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | `undefined` |
| `encoding` | `BufferEncoding` | `"utf8"` |

#### Returns

`this`

***

### writeUint32()

```ts
writeUint32(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:29](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L29)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `number` |

#### Returns

`this`

***

### writeUint64()

```ts
writeUint64(value): this;
```

Defined in: [src/protocols/ssh/binary/SshDataWriter.ts:43](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/protocols/ssh/binary/SshDataWriter.ts#L43)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `bigint` |

#### Returns

`this`
