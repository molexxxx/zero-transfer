[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseCronExpression

# Function: parseCronExpression()

```ts
function parseCronExpression(expression): CronExpression;
```

Defined in: [src/mft/cron.ts:41](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/cron.ts#L41)

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
