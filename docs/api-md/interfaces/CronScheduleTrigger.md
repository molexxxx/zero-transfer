[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CronScheduleTrigger

# Interface: CronScheduleTrigger

Defined in: [src/mft/MftSchedule.ts:27](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/MftSchedule.ts#L27)

Fires at times matching a 5-field cron expression (minute hour dom month dow).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="expression"></a> `expression` | `string` | 5-field cron expression: `minute hour day-of-month month day-of-week`. | [src/mft/MftSchedule.ts:31](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/MftSchedule.ts#L31) |
| <a id="kind"></a> `kind` | `"cron"` | Discriminator. | [src/mft/MftSchedule.ts:29](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/MftSchedule.ts#L29) |
| <a id="timezone"></a> `timezone?` | `"local"` \| `"utc"` | Timezone interpretation. Defaults to `"utc"`. | [src/mft/MftSchedule.ts:33](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/MftSchedule.ts#L33) |
