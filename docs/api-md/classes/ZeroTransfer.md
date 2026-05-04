[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransfer

# Class: ZeroTransfer

Defined in: [src/client/ZeroTransfer.ts:62](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L62)

SDK entry point for FTP, FTPS, and SFTP workflows.

## Remarks

ZeroTransfer extends Node.js EventEmitter so applications can observe lifecycle
events while still using promise-based APIs for operations. The facade is
deliberately protocol-neutral; concrete behavior lives behind
[RemoteFileAdapter](../interfaces/RemoteFileAdapter.md).

## Extends

- `EventEmitter`

## Constructors

### Constructor

```ts
new ZeroTransfer(options?): ZeroTransfer;
```

Defined in: [src/client/ZeroTransfer.ts:78](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L78)

Creates a client facade without opening a network connection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZeroTransferOptions`](../interfaces/ZeroTransferOptions.md) | Optional facade configuration, logger, and protocol adapter. |

#### Returns

`ZeroTransfer`

#### Overrides

```ts
EventEmitter.constructor
```

## Methods

### \[captureRejectionSymbol\]()?

```ts
optional [captureRejectionSymbol](
   error, 
   event, ...
   args): void;
```

Defined in: node\_modules/@types/node/events.d.ts:87

The `Symbol.for('nodejs.rejection')` method is called in case a
promise rejection happens when emitting an event and
`captureRejections` is enabled on the emitter.
It is possible to use `events.captureRejectionSymbol` in
place of `Symbol.for('nodejs.rejection')`.

```js
import { EventEmitter, captureRejectionSymbol } from 'node:events';

class MyClass extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
  }

  [captureRejectionSymbol](err, event, ...args) {
    console.log('rejection happened for', event, 'with', err, ...args);
    this.destroy(err);
  }

  destroy(err) {
    // Tear the resource down here.
  }
}
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `Error` |
| `event` | `string` \| `symbol` |
| ...`args` | `any`[] |

#### Returns

`void`

#### Since

v13.4.0, v12.16.0

#### Inherited from

```ts
EventEmitter.[captureRejectionSymbol]
```

***

### addListener()

```ts
addListener<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:92

Alias for `emitter.on(eventName, listener)`.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`) => `void` |

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

```ts
EventEmitter.addListener
```

***

### connect()

```ts
static connect(profile, options?): Promise<ZeroTransfer>;
```

Defined in: [src/client/ZeroTransfer.ts:103](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L103)

Creates a client and connects it in one step.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Remote host, authentication, and protocol connection settings. |
| `options` | [`ZeroTransferOptions`](../interfaces/ZeroTransferOptions.md) | Optional facade settings that can be overridden by the profile. |

#### Returns

`Promise`\<`ZeroTransfer`\>

A connected ZeroTransfer instance.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When no adapter is available for the protocol.

***

### connect()

```ts
connect(profile): Promise<void>;
```

Defined in: [src/client/ZeroTransfer.ts:131](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L131)

Opens a remote connection through the configured protocol adapter.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Remote host, authentication, timeout, logger, and protocol settings. |

#### Returns

`Promise`\<`void`\>

A promise that resolves after the adapter reports a successful connection.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When the client does not have an adapter.

***

### create()

```ts
static create(options?): ZeroTransfer;
```

Defined in: [src/client/ZeroTransfer.ts:91](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L91)

Creates a new client facade using the provided options.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ZeroTransferOptions`](../interfaces/ZeroTransferOptions.md) | Optional facade configuration, logger, and adapter. |

#### Returns

`ZeroTransfer`

A disconnected ZeroTransfer instance.

***

### disconnect()

```ts
disconnect(): Promise<void>;
```

Defined in: [src/client/ZeroTransfer.ts:158](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L158)

Closes the active remote connection if one exists.

#### Returns

`Promise`\<`void`\>

A promise that resolves after the adapter disconnects or immediately when idle.

***

### emit()

```ts
emit<E>(eventName, ...args): boolean;
```

Defined in: node\_modules/@types/node/events.d.ts:134

Synchronously calls each of the listeners registered for the event named
`eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |
| ...`args` | `any`[] |

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

```ts
EventEmitter.emit
```

***

### eventNames()

```ts
eventNames(): (string | symbol)[];
```

Defined in: node\_modules/@types/node/events.d.ts:154

Returns an array listing the events for which the emitter has registered
listeners.

```js
import { EventEmitter } from 'node:events';

const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

#### Returns

(`string` \| `symbol`)[]

#### Since

v6.0.0

#### Inherited from

```ts
EventEmitter.eventNames
```

***

### getCapabilities()

```ts
getCapabilities(): ZeroTransferCapabilities;
```

Defined in: [src/client/ZeroTransfer.ts:181](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L181)

Describes protocol and adapter readiness for feature discovery.

#### Returns

[`ZeroTransferCapabilities`](../interfaces/ZeroTransferCapabilities.md)

A capability snapshot for diagnostics and UI state.

***

### getMaxListeners()

```ts
getMaxListeners(): number;
```

Defined in: node\_modules/@types/node/events.d.ts:161

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to
`events.defaultMaxListeners`.

#### Returns

`number`

#### Since

v1.0.0

#### Inherited from

```ts
EventEmitter.getMaxListeners
```

***

### isConnected()

```ts
isConnected(): boolean;
```

Defined in: [src/client/ZeroTransfer.ts:172](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L172)

Checks whether the facade currently considers the adapter connected.

#### Returns

`boolean`

`true` after a successful connection and before disconnection.

***

### list()

```ts
list(path, options?): Promise<RemoteEntry[]>;
```

Defined in: [src/client/ZeroTransfer.ts:196](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L196)

Lists remote entries for a path using the configured adapter.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | Remote directory path to inspect. |
| `options?` | [`ListOptions`](../interfaces/ListOptions.md) | Optional listing controls such as recursion and abort signal. |

#### Returns

`Promise`\<[`RemoteEntry`](../interfaces/RemoteEntry.md)[]\>

Normalized remote entries for the requested directory.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When the client does not have an adapter.

***

### listenerCount()

```ts
listenerCount<E>(eventName, listener?): number;
```

Defined in: node\_modules/@types/node/events.d.ts:170

Returns the number of listeners listening for the event named `eventName`.
If `listener` is provided, it will return how many times the listener is found
in the list of the listeners of the event.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `eventName` | `string` \| `symbol` | The name of the event being listened for |
| `listener?` | (...`args`) => `void` | The event handler function |

#### Returns

`number`

#### Since

v3.2.0

#### Inherited from

```ts
EventEmitter.listenerCount
```

***

### listeners()

```ts
listeners<E>(eventName): (...args) => void[];
```

Defined in: node\_modules/@types/node/events.d.ts:186

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |

#### Returns

(...`args`) => `void`[]

#### Since

v0.1.26

#### Inherited from

```ts
EventEmitter.listeners
```

***

### off()

```ts
off<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:191

Alias for `emitter.removeListener()`.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`) => `void` |

#### Returns

`this`

#### Since

v10.0.0

#### Inherited from

```ts
EventEmitter.off
```

***

### on()

```ts
on<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:225

Adds the `listener` function to the end of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The
`emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v0.1.101

#### Inherited from

```ts
EventEmitter.on
```

***

### once()

```ts
once<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:256

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The
`emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v0.3.0

#### Inherited from

```ts
EventEmitter.once
```

***

### prependListener()

```ts
prependListener<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:275

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v6.0.0

#### Inherited from

```ts
EventEmitter.prependListener
```

***

### prependOnceListener()

```ts
prependOnceListener<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:292

Adds a **one-time** `listener` function for the event named `eventName` to the
_beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `eventName` | `string` \| `symbol` | The name of the event. |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v6.0.0

#### Inherited from

```ts
EventEmitter.prependOnceListener
```

***

### rawListeners()

```ts
rawListeners<E>(eventName): (...args) => void[];
```

Defined in: node\_modules/@types/node/events.d.ts:326

Returns a copy of the array of listeners for the event named `eventName`,
including any wrappers (such as those created by `.once()`).

```js
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Returns a new Array with a function `onceWrapper` which has a property
// `listener` which contains the original listener bound above
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Logs "log once" to the console and does not unbind the `once` event
logFnWrapper.listener();

// Logs "log once" to the console and removes the listener
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Will return a new Array with a single function bound by `.on()` above
const newListeners = emitter.rawListeners('log');

// Logs "log persistently" twice
newListeners[0]();
emitter.emit('log');
```

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |

#### Returns

(...`args`) => `void`[]

#### Since

v9.4.0

#### Inherited from

```ts
EventEmitter.rawListeners
```

***

### removeAllListeners()

```ts
removeAllListeners<E>(eventName?): this;
```

Defined in: node\_modules/@types/node/events.d.ts:338

Removes all listeners, or those of the specified `eventName`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName?` | `string` \| `symbol` |

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

```ts
EventEmitter.removeAllListeners
```

***

### removeListener()

```ts
removeListener<E>(eventName, listener): this;
```

Defined in: node\_modules/@types/node/events.d.ts:425

Removes the specified `listener` from the listener array for the event named
`eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any
`removeListener()` or `removeAllListeners()` calls _after_ emitting and
_before_ the last listener finishes execution will not remove them from
`emit()` in progress. Subsequent events behave as expected.

```js
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indexes of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')`
listener is removed:

```js
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* `string` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `eventName` | `string` \| `symbol` |
| `listener` | (...`args`) => `void` |

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

```ts
EventEmitter.removeListener
```

***

### setMaxListeners()

```ts
setMaxListeners(n): this;
```

Defined in: node\_modules/@types/node/events.d.ts:436

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to
`Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

#### Since

v0.3.5

#### Inherited from

```ts
EventEmitter.setMaxListeners
```

***

### stat()

```ts
stat(path, options?): Promise<RemoteStat>;
```

Defined in: [src/client/ZeroTransfer.ts:208](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L208)

Reads metadata for a remote path using the configured adapter.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | Remote file, directory, or symbolic-link path to inspect. |
| `options?` | [`StatOptions`](../interfaces/StatOptions.md) | Optional stat controls such as abort signal. |

#### Returns

`Promise`\<[`RemoteStat`](../interfaces/RemoteStat.md)\>

Normalized metadata for an existing remote entry.

#### Throws

[UnsupportedFeatureError](UnsupportedFeatureError.md) When the client does not have an adapter.

## Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="createtransferclient"></a> `createTransferClient` | `readonly` | (`options`) => [`TransferClient`](TransferClient.md) | `createTransferClient` | Creates a provider-neutral transfer client with the built-in provider registry. | [src/client/ZeroTransfer.ts:64](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L64) |
| <a id="protocol"></a> `protocol` | `readonly` | `"ftp"` \| `"ftps"` \| `"sftp"` | `undefined` | Protocol selected for this client instance. | [src/client/ZeroTransfer.ts:67](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/client/ZeroTransfer.ts#L67) |
