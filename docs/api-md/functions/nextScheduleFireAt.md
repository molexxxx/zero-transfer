[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / nextScheduleFireAt

# Function: nextScheduleFireAt()

```ts
function nextScheduleFireAt(schedule, from?): Date | undefined;
```

Defined in: [src/mft/MftSchedule.ts:101](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/mft/MftSchedule.ts#L101)

Computes the next fire time for a schedule strictly after `from`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule whose next fire time should be computed. |
| `from` | `Date` | Reference time. Defaults to the current wall clock. |

## Returns

`Date` \| `undefined`

The next fire time, or `undefined` when no future fire exists.
