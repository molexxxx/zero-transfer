[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / nextScheduleFireAt

# Function: nextScheduleFireAt()

```ts
function nextScheduleFireAt(schedule, from?): Date | undefined;
```

Defined in: [src/mft/MftSchedule.ts:101](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L101)

Computes the next fire time for a schedule strictly after `from`.

## Parameters

| Parameter  | Type                                          | Description                                         |
| ---------- | --------------------------------------------- | --------------------------------------------------- |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule whose next fire time should be computed.   |
| `from`     | `Date`                                        | Reference time. Defaults to the current wall clock. |

## Returns

`Date` \| `undefined`

The next fire time, or `undefined` when no future fire exists.
