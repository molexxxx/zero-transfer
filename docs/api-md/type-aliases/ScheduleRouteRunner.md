[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / ScheduleRouteRunner

# Type Alias: ScheduleRouteRunner

```ts
type ScheduleRouteRunner = (input) => Promise<TransferReceipt>;
```

Defined in: [src/mft/MftScheduler.ts:22](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/MftScheduler.ts#L22)

Function shape used to fire a route. Defaults to [runRoute](../functions/runRoute.md).

## Parameters

| Parameter        | Type                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input`          | \{ `client`: [`TransferClient`](../classes/TransferClient.md); `route`: [`MftRoute`](../interfaces/MftRoute.md); `schedule`: [`MftSchedule`](../interfaces/MftSchedule.md); `signal`: `AbortSignal`; \} |
| `input.client`   | [`TransferClient`](../classes/TransferClient.md)                                                                                                                                                        |
| `input.route`    | [`MftRoute`](../interfaces/MftRoute.md)                                                                                                                                                                 |
| `input.schedule` | [`MftSchedule`](../interfaces/MftSchedule.md)                                                                                                                                                           |
| `input.signal`   | `AbortSignal`                                                                                                                                                                                           |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>
