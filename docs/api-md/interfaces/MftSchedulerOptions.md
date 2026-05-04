[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftSchedulerOptions

# Interface: MftSchedulerOptions

Defined in: [src/mft/MftScheduler.ts:40](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L40)

Construction options for [MftScheduler](../classes/MftScheduler.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client passed to each fired route. | [src/mft/MftScheduler.ts:42](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L42) |
| <a id="onerror"></a> `onError?` | (`input`) => `void` | Observer fired when a single route fire fails. | [src/mft/MftScheduler.ts:54](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L54) |
| <a id="onfire"></a> `onFire?` | (`input`) => `void` | Observer fired before each route is dispatched. | [src/mft/MftScheduler.ts:50](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L50) |
| <a id="onresult"></a> `onResult?` | (`input`) => `void` | Observer fired after a successful route execution. | [src/mft/MftScheduler.ts:52](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L52) |
| <a id="routes"></a> `routes` | [`RouteRegistry`](../classes/RouteRegistry.md) | Routes registry resolved by `route id`. | [src/mft/MftScheduler.ts:44](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L44) |
| <a id="runner"></a> `runner?` | [`ScheduleRouteRunner`](../type-aliases/ScheduleRouteRunner.md) | Optional runner override. Defaults to invoking [runRoute](../functions/runRoute.md). | [src/mft/MftScheduler.ts:48](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L48) |
| <a id="schedules"></a> `schedules` | [`ScheduleRegistry`](../classes/ScheduleRegistry.md) | Schedules registry watched by the scheduler. | [src/mft/MftScheduler.ts:46](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L46) |
| <a id="timer"></a> `timer?` | [`ScheduleTimerHooks`](ScheduleTimerHooks.md) | Timer/clock injection used by tests. | [src/mft/MftScheduler.ts:56](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/mft/MftScheduler.ts#L56) |
