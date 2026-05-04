[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpResponseParser

# Class: FtpResponseParser

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:57](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpResponseParser.ts#L57)

Stateful parser for socket-delivered FTP response text.

## Constructors

### Constructor

```ts
new FtpResponseParser(): FtpResponseParser;
```

#### Returns

`FtpResponseParser`

## Methods

### hasPendingResponse()

```ts
hasPendingResponse(): boolean;
```

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:101](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpResponseParser.ts#L101)

Checks whether the parser is holding buffered or incomplete response data.

#### Returns

`boolean`

`true` when there is unconsumed text or an open multi-line response.

***

### push()

```ts
push(chunk): FtpResponse[];
```

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:68](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpResponseParser.ts#L68)

Adds incoming socket data and returns any complete responses.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `chunk` | `string` \| `Buffer`\<`ArrayBufferLike`\> | Buffer or string chunk from the FTP control connection. |

#### Returns

[`FtpResponse`](../interfaces/FtpResponse.md)[]

Zero or more complete parsed responses.

#### Throws

[ParseError](ParseError.md) When a malformed standalone response line is received.

***

### reset()

```ts
reset(): void;
```

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:91](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/ftp/FtpResponseParser.ts#L91)

Clears buffered text and any incomplete multi-line response state.

#### Returns

`void`

Nothing.
