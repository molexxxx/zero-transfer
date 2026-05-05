[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ScheduleTimerHooks

# Interface: ScheduleTimerHooks

Defined in: [src/mft/MftScheduler.ts:30](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/MftScheduler.ts#L30)

Timer hooks injected by tests so fake clocks stay deterministic.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cleartimer"></a> `clearTimer?` | (`handle`) => `void` | Cancels a pending timer handle returned by `setTimer`. Defaults to `clearTimeout`. | [src/mft/MftScheduler.ts:36](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/MftScheduler.ts#L36) |
| <a id="now"></a> `now?` | () => `Date` | Returns the current wall-clock time. Defaults to `() => new Date()`. | [src/mft/MftScheduler.ts:32](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/MftScheduler.ts#L32) |
| <a id="settimer"></a> `setTimer?` | (`callback`, `delayMs`) => `unknown` | Schedules a one-shot callback after `delayMs`. Defaults to `setTimeout`. | [src/mft/MftScheduler.ts:34](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/MftScheduler.ts#L34) |
