[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ScheduleRouteRunner

# Type Alias: ScheduleRouteRunner

```ts
type ScheduleRouteRunner = (input) => Promise<TransferReceipt>;
```

Defined in: [src/mft/MftScheduler.ts:22](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/MftScheduler.ts#L22)

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
