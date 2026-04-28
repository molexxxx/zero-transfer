[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / IntervalScheduleTrigger

# Interface: IntervalScheduleTrigger

Defined in: [src/mft/MftSchedule.ts:14](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L14)

Repeats every `everyMs` milliseconds from a fixed reference point.

## Properties

| Property                       | Type         | Description                                                                                                                                                         | Defined in                                                                                                                                        |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="anchor"></a> `anchor?`  | `Date`       | Reference time used to anchor the interval. Defaults to the scheduler start time. Fires occur at `anchor + n * everyMs` for the smallest `n` strictly after `from`. | [src/mft/MftSchedule.ts:23](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L23) |
| <a id="everyms"></a> `everyMs` | `number`     | Period between fires in milliseconds. Must be a positive finite number.                                                                                             | [src/mft/MftSchedule.ts:18](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L18) |
| <a id="kind"></a> `kind`       | `"interval"` | Discriminator.                                                                                                                                                      | [src/mft/MftSchedule.ts:16](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftSchedule.ts#L16) |
