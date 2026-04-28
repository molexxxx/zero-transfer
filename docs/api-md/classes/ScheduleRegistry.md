[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ScheduleRegistry

# Class: ScheduleRegistry

Defined in: [src/mft/ScheduleRegistry.ts:10](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L10)

Mutable in-memory registry of MFT schedules.

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: [src/mft/ScheduleRegistry.ts:93](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L93)

Number of schedules currently registered.

##### Returns

`number`

## Constructors

### Constructor

```ts
new ScheduleRegistry(schedules?): ScheduleRegistry;
```

Defined in: [src/mft/ScheduleRegistry.ts:18](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L18)

Creates a registry and optionally seeds it with schedules.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `schedules` | `Iterable`\<[`MftSchedule`](../interfaces/MftSchedule.md)\> | `[]` | Schedules to register immediately. |

#### Returns

`ScheduleRegistry`

## Methods

### get()

```ts
get(scheduleId): MftSchedule | undefined;
```

Defined in: [src/mft/ScheduleRegistry.ts:62](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L62)

Gets a schedule when registered.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `scheduleId` | `string` |

#### Returns

[`MftSchedule`](../interfaces/MftSchedule.md) \| `undefined`

***

### has()

```ts
has(scheduleId): boolean;
```

Defined in: [src/mft/ScheduleRegistry.ts:57](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L57)

Checks whether a schedule id is registered.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `scheduleId` | `string` |

#### Returns

`boolean`

***

### list()

```ts
list(): MftSchedule[];
```

Defined in: [src/mft/ScheduleRegistry.ts:88](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L88)

Returns all schedules in registration order.

#### Returns

[`MftSchedule`](../interfaces/MftSchedule.md)[]

***

### register()

```ts
register(schedule): this;
```

Defined in: [src/mft/ScheduleRegistry.ts:31](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L31)

Registers a schedule.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule to add. |

#### Returns

`this`

This registry for fluent setup.

#### Throws

[ConfigurationError](ConfigurationError.md) When the schedule is malformed or a duplicate.

***

### require()

```ts
require(scheduleId): MftSchedule;
```

Defined in: [src/mft/ScheduleRegistry.ts:73](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L73)

Gets a schedule or throws when missing.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scheduleId` | `string` | Schedule id to retrieve. |

#### Returns

[`MftSchedule`](../interfaces/MftSchedule.md)

The schedule.

#### Throws

[ConfigurationError](ConfigurationError.md) When no schedule is registered under the id.

***

### unregister()

```ts
unregister(scheduleId): boolean;
```

Defined in: [src/mft/ScheduleRegistry.ts:52](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/ScheduleRegistry.ts#L52)

Removes a schedule.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scheduleId` | `string` | Schedule id to remove. |

#### Returns

`boolean`

`true` when a schedule was removed.
