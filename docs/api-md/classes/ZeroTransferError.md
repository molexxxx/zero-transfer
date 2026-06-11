[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferError

# Class: ZeroTransferError

Defined in: [src/errors/ZeroTransferError.ts:52](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L52)

Base class for all typed ZeroTransfer errors.

## Extends

- `Error`

## Extended by

- [`AbortError`](AbortError.md)
- [`AuthenticationError`](AuthenticationError.md)
- [`AuthorizationError`](AuthorizationError.md)
- [`ConfigurationError`](ConfigurationError.md)
- [`ConnectionError`](ConnectionError.md)
- [`ParseError`](ParseError.md)
- [`PathAlreadyExistsError`](PathAlreadyExistsError.md)
- [`PathNotFoundError`](PathNotFoundError.md)
- [`PermissionDeniedError`](PermissionDeniedError.md)
- [`ProtocolError`](ProtocolError.md)
- [`TimeoutError`](TimeoutError.md)
- [`TransferError`](TransferError.md)
- [`UnsupportedFeatureError`](UnsupportedFeatureError.md)
- [`VerificationError`](VerificationError.md)
- [`ApprovalRejectedError`](ApprovalRejectedError.md)
- [`ApprovalTimeoutError`](ApprovalTimeoutError.md)

## Constructors

### Constructor

```ts
new ZeroTransferError(details): ZeroTransferError;
```

Defined in: [src/errors/ZeroTransferError.ts:77](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L77)

Creates a structured SDK error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `details` | [`ZeroTransferErrorDetails`](../interfaces/ZeroTransferErrorDetails.md) | Code, message, retryability, and optional protocol context. |

#### Returns

`ZeroTransferError`

#### Overrides

```ts
Error.constructor
```

## Methods

### captureStackTrace()

```ts
static captureStackTrace(targetObject, constructorOpt?): void;
```

Defined in: node\_modules/@types/node/globals.d.ts:51

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

```ts
Error.captureStackTrace
```

***

### prepareStackTrace()

```ts
static prepareStackTrace(err, stackTraces): any;
```

Defined in: node\_modules/@types/node/globals.d.ts:55

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

```ts
Error.prepareStackTrace
```

***

### toJSON()

```ts
toJSON(): Record<string, unknown>;
```

Defined in: [src/errors/ZeroTransferError.ts:102](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L102)

Serializes the error into a plain object suitable for logs or API responses.

`details` and `command` are passed through secret redaction so serialized
errors never leak credentials, signed URLs, or raw protocol commands. The
live [details](#details) property stays unredacted
for programmatic consumers.

#### Returns

`Record`\<`string`, `unknown`\>

A JSON-safe object containing public structured error fields.

## Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `public` | `unknown` | - | `Error.cause` | node\_modules/typescript/lib/lib.es2022.error.d.ts:24 |
| <a id="code"></a> `code` | `readonly` | `string` | Stable machine-readable error code. | - | [src/errors/ZeroTransferError.ts:54](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L54) |
| <a id="command"></a> `command?` | `readonly` | `string` | Protocol command associated with the failure, if any. | - | [src/errors/ZeroTransferError.ts:60](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L60) |
| <a id="details"></a> `details?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional structured details for diagnostics. | - | [src/errors/ZeroTransferError.ts:70](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L70) |
| <a id="ftpcode"></a> `ftpCode?` | `readonly` | `number` | FTP response code associated with the failure. | - | [src/errors/ZeroTransferError.ts:62](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L62) |
| <a id="host"></a> `host?` | `readonly` | `string` | Remote host associated with the failing operation. | - | [src/errors/ZeroTransferError.ts:58](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L58) |
| <a id="message"></a> `message` | `public` | `string` | - | `Error.message` | node\_modules/typescript/lib/lib.es5.d.ts:1075 |
| <a id="name"></a> `name` | `public` | `string` | - | `Error.name` | node\_modules/typescript/lib/lib.es5.d.ts:1074 |
| <a id="path"></a> `path?` | `readonly` | `string` | Remote path associated with the failure. | - | [src/errors/ZeroTransferError.ts:66](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L66) |
| <a id="protocol"></a> `protocol?` | `readonly` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol active when the error occurred. | - | [src/errors/ZeroTransferError.ts:56](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L56) |
| <a id="retryable"></a> `retryable` | `readonly` | `boolean` | Whether retry policy may safely retry this failure. | - | [src/errors/ZeroTransferError.ts:68](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L68) |
| <a id="sftpcode"></a> `sftpCode?` | `readonly` | `number` | SFTP status code associated with the failure. | - | [src/errors/ZeroTransferError.ts:64](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L64) |
| <a id="stack"></a> `stack?` | `public` | `string` | - | `Error.stack` | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="stacktracelimit"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | `Error.stackTraceLimit` | node\_modules/@types/node/globals.d.ts:67 |
