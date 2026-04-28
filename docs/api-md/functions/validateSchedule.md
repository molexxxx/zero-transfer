[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / validateSchedule

# Function: validateSchedule()

```ts
function validateSchedule(schedule): MftSchedule;
```

Defined in: [src/mft/MftSchedule.ts:74](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/MftSchedule.ts#L74)

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
