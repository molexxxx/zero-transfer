[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftSchedule

# Interface: MftSchedule

Defined in: [src/mft/MftSchedule.ts:40](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L40)

Declarative schedule binding a route id to a trigger.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="enabled"></a> `enabled?` | `boolean` | Whether the schedule is enabled. Defaults to `true`. | [src/mft/MftSchedule.ts:48](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L48) |
| <a id="id"></a> `id` | `string` | Stable schedule identifier. | [src/mft/MftSchedule.ts:42](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L42) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for audit records and diagnostics. | [src/mft/MftSchedule.ts:50](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L50) |
| <a id="routeid"></a> `routeId` | `string` | Route id the schedule fires through [runRoute](../functions/runRoute.md). | [src/mft/MftSchedule.ts:44](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L44) |
| <a id="trigger"></a> `trigger` | [`MftScheduleTrigger`](../type-aliases/MftScheduleTrigger.md) | Trigger definition. | [src/mft/MftSchedule.ts:46](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftSchedule.ts#L46) |
