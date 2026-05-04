[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseCronExpression

# Function: parseCronExpression()

```ts
function parseCronExpression(expression): CronExpression;
```

Defined in: [src/mft/cron.ts:41](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/cron.ts#L41)

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
