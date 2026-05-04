[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseCronExpression

# Function: parseCronExpression()

```ts
function parseCronExpression(expression): CronExpression;
```

Defined in: [src/mft/cron.ts:41](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/mft/cron.ts#L41)

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
