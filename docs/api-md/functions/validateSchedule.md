[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / validateSchedule

# Function: validateSchedule()

```ts
function validateSchedule(schedule): MftSchedule;
```

Defined in: [src/mft/MftSchedule.ts:74](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/MftSchedule.ts#L74)

Validates a schedule and returns it for fluent setup.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule to validate. |

## Returns

[`MftSchedule`](../interfaces/MftSchedule.md)

The same schedule instance.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the schedule is malformed.
