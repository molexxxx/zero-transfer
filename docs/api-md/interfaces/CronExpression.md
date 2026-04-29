[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CronExpression

# Interface: CronExpression

Defined in: [src/mft/cron.ts:17](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L17)

Compiled cron expression.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="dayofmonth"></a> `dayOfMonth` | [`CronField`](../type-aliases/CronField.md) | Days of month 1-31. | [src/mft/cron.ts:23](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L23) |
| <a id="dayofweek"></a> `dayOfWeek` | [`CronField`](../type-aliases/CronField.md) | Days of week 0-6 (Sunday = 0). | [src/mft/cron.ts:27](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L27) |
| <a id="hasdomconstraint"></a> `hasDomConstraint` | `boolean` | Whether day-of-month was specified explicitly. | [src/mft/cron.ts:29](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L29) |
| <a id="hasdowconstraint"></a> `hasDowConstraint` | `boolean` | Whether day-of-week was specified explicitly. | [src/mft/cron.ts:31](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L31) |
| <a id="hour"></a> `hour` | [`CronField`](../type-aliases/CronField.md) | Hours 0-23. | [src/mft/cron.ts:21](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L21) |
| <a id="minute"></a> `minute` | [`CronField`](../type-aliases/CronField.md) | Minutes 0-59. | [src/mft/cron.ts:19](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L19) |
| <a id="month"></a> `month` | [`CronField`](../type-aliases/CronField.md) | Months 1-12. | [src/mft/cron.ts:25](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/cron.ts#L25) |
