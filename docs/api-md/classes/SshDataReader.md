[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshDataReader

# Class: SshDataReader

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:7](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L7)

Stateful SSH primitive decoder that reads sequential values from a packet payload.

## Accessors

### remaining

#### Get Signature

```ts
get remaining(): number;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:12](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L12)

##### Returns

`number`

## Constructors

### Constructor

```ts
new SshDataReader(source): SshDataReader;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:10](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L10)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `Uint8Array` |

#### Returns

`SshDataReader`

## Methods

### assertFinished()

```ts
assertFinished(): void;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:85](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L85)

#### Returns

`void`

***

### hasMore()

```ts
hasMore(): boolean;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:16](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L16)

#### Returns

`boolean`

***

### readBoolean()

```ts
readBoolean(): boolean;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:27](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L27)

#### Returns

`boolean`

***

### readByte()

```ts
readByte(): number;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:20](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L20)

#### Returns

`number`

***

### readBytes()

```ts
readBytes(length): Buffer;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:31](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L31)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `length` | `number` |

#### Returns

`Buffer`

***

### readMpint()

```ts
readMpint(): Buffer;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:81](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L81)

Reads an SSH `mpint` value (RFC 4251 §5): a length-prefixed two's-complement
big-endian integer. Returns the raw magnitude bytes (non-negative integers
may have a leading 0x00 byte preserved by the caller as needed).

#### Returns

`Buffer`

***

### readNameList()

```ts
readNameList(): string[];
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:66](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L66)

#### Returns

`string`[]

***

### readString()

```ts
readString(): Buffer;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:54](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L54)

#### Returns

`Buffer`

***

### readUint32()

```ts
readUint32(): number;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:38](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L38)

#### Returns

`number`

***

### readUint64()

```ts
readUint64(): bigint;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:46](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L46)

#### Returns

`bigint`

***

### readUtf8String()

```ts
readUtf8String(): string;
```

Defined in: [src/protocols/ssh/binary/SshDataReader.ts:62](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/protocols/ssh/binary/SshDataReader.ts#L62)

#### Returns

`string`
