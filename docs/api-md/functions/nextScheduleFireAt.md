[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / nextScheduleFireAt

# Function: nextScheduleFireAt()

```ts
function nextScheduleFireAt(schedule, from?): Date | undefined;
```

Defined in: [src/mft/MftSchedule.ts:101](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/MftSchedule.ts#L101)

Computes the next fire time for a schedule strictly after `from`.

## Parameters

| Parameter  | Type                                          | Description                                         |
| ---------- | --------------------------------------------- | --------------------------------------------------- |
| `schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) | Schedule whose next fire time should be computed.   |
| `from`     | `Date`                                        | Reference time. Defaults to the current wall clock. |

## Returns

`Date` \| `undefined`

The next fire time, or `undefined` when no future fire exists.
