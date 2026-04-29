[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftScheduler

# Class: MftScheduler

Defined in: [src/mft/MftScheduler.ts:65](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/MftScheduler.ts#L65)

Runs routes on configured schedules.

## Accessors

### isRunning

#### Get Signature

```ts
get isRunning(): boolean;
```

Defined in: [src/mft/MftScheduler.ts:91](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/MftScheduler.ts#L91)

Whether the scheduler is currently running.

##### Returns

`boolean`

## Constructors

### Constructor

```ts
new MftScheduler(options): MftScheduler;
```

Defined in: [src/mft/MftScheduler.ts:80](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/MftScheduler.ts#L80)

Creates a scheduler bound to a transfer client and registries.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MftSchedulerOptions`](../interfaces/MftSchedulerOptions.md) | Client, registries, optional runner, observers, and timer hooks. |

#### Returns

`MftScheduler`

## Methods

### start()

```ts
start(): void;
```

Defined in: [src/mft/MftScheduler.ts:96](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/MftScheduler.ts#L96)

Starts the scheduler. No-op when already running.

#### Returns

`void`

***

### stop()

```ts
stop(): Promise<void>;
```

Defined in: [src/mft/MftScheduler.ts:111](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/MftScheduler.ts#L111)

Stops the scheduler and aborts in-flight route executions.

#### Returns

`Promise`\<`void`\>

A promise that resolves once all in-flight fires have settled.
