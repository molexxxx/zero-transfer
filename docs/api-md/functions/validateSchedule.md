[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / validateSchedule

# Function: validateSchedule()

```ts
function validateSchedule(schedule): MftSchedule;
```

Defined in: [src/mft/MftSchedule.ts:74](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L74)

Validates a schedule and returns it for fluent setup.

## Parameters

| Parameter  | Type                                          | Description           |
| ---------- | --------------------------------------------- | --------------------- |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule to validate. |

## Returns

[`MftSchedule`](../interfaces/MftSchedule.md)

The same schedule instance.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the schedule is malformed.
