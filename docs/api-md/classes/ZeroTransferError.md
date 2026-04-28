[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferError

# Class: ZeroTransferError

Defined in: [src/errors/ZeroTransferError.ts:51](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L51)

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

## Constructors

### Constructor

```ts
new ZeroTransferError(details): ZeroTransferError;
```

Defined in: [src/errors/ZeroTransferError.ts:76](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L76)

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

Defined in: [src/errors/ZeroTransferError.ts:96](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L96)

Serializes the error into a plain object suitable for logs or API responses.

#### Returns

`Record`\<`string`, `unknown`\>

A JSON-safe object containing public structured error fields.

## Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `public` | `unknown` | - | `Error.cause` | node\_modules/typescript/lib/lib.es2022.error.d.ts:24 |
| <a id="code"></a> `code` | `readonly` | `string` | Stable machine-readable error code. | - | [src/errors/ZeroTransferError.ts:53](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L53) |
| <a id="command"></a> `command?` | `readonly` | `string` | Protocol command associated with the failure, if any. | - | [src/errors/ZeroTransferError.ts:59](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L59) |
| <a id="details"></a> `details?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional structured details for diagnostics. | - | [src/errors/ZeroTransferError.ts:69](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L69) |
| <a id="ftpcode"></a> `ftpCode?` | `readonly` | `number` | FTP response code associated with the failure. | - | [src/errors/ZeroTransferError.ts:61](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L61) |
| <a id="host"></a> `host?` | `readonly` | `string` | Remote host associated with the failing operation. | - | [src/errors/ZeroTransferError.ts:57](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L57) |
| <a id="message"></a> `message` | `public` | `string` | - | `Error.message` | node\_modules/typescript/lib/lib.es5.d.ts:1075 |
| <a id="name"></a> `name` | `public` | `string` | - | `Error.name` | node\_modules/typescript/lib/lib.es5.d.ts:1074 |
| <a id="path"></a> `path?` | `readonly` | `string` | Remote path associated with the failure. | - | [src/errors/ZeroTransferError.ts:65](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L65) |
| <a id="protocol"></a> `protocol?` | `readonly` | `"ftp"` \| `"ftps"` \| `"sftp"` | Protocol active when the error occurred. | - | [src/errors/ZeroTransferError.ts:55](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L55) |
| <a id="retryable"></a> `retryable` | `readonly` | `boolean` | Whether retry policy may safely retry this failure. | - | [src/errors/ZeroTransferError.ts:67](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L67) |
| <a id="sftpcode"></a> `sftpCode?` | `readonly` | `number` | SFTP status code associated with the failure. | - | [src/errors/ZeroTransferError.ts:63](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/errors/ZeroTransferError.ts#L63) |
| <a id="stack"></a> `stack?` | `public` | `string` | - | `Error.stack` | node\_modules/typescript/lib/lib.es5.d.ts:1076 |
| <a id="stacktracelimit"></a> `stackTraceLimit` | `static` | `number` | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | `Error.stackTraceLimit` | node\_modules/@types/node/globals.d.ts:67 |
