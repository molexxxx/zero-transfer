[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseCronExpression

# Function: parseCronExpression()

```ts
function parseCronExpression(expression): CronExpression;
```

Defined in: [src/mft/cron.ts:41](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/cron.ts#L41)

Parses a 5-field cron expression.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `expression` | `string` | Whitespace-separated 5-field cron expression. |

## Returns

[`CronExpression`](../interfaces/CronExpression.md)

Compiled representation usable by [nextCronFireAt](nextCronFireAt.md).

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the expression is malformed.
