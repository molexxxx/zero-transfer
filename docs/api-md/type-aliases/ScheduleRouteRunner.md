[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ScheduleRouteRunner

# Type Alias: ScheduleRouteRunner

```ts
type ScheduleRouteRunner = (input) => Promise<TransferReceipt>;
```

Defined in: [src/mft/MftScheduler.ts:22](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/mft/MftScheduler.ts#L22)

Function shape used to fire a route. Defaults to [runRoute](../functions/runRoute.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | \{ `client`: [`TransferClient`](../classes/TransferClient.md); `route`: [`MftRoute`](../interfaces/MftRoute.md); `schedule`: [`MftSchedule`](../interfaces/MftSchedule.md); `signal`: `AbortSignal`; \} |
| `input.client` | [`TransferClient`](../classes/TransferClient.md) |
| `input.route` | [`MftRoute`](../interfaces/MftRoute.md) |
| `input.schedule` | [`MftSchedule`](../interfaces/MftSchedule.md) |
| `input.signal` | `AbortSignal` |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>
