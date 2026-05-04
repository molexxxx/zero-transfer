[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ScheduleRouteRunner

# Type Alias: ScheduleRouteRunner

```ts
type ScheduleRouteRunner = (input) => Promise<TransferReceipt>;
```

Defined in: [src/mft/MftScheduler.ts:22](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/MftScheduler.ts#L22)

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
