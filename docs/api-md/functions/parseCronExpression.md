[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / parseCronExpression

# Function: parseCronExpression()

```ts
function parseCronExpression(expression): CronExpression;
```

Defined in: [src/mft/cron.ts:41](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/cron.ts#L41)

Parses a 5-field cron expression.

## Parameters

| Parameter    | Type     | Description                                   |
| ------------ | -------- | --------------------------------------------- |
| `expression` | `string` | Whitespace-separated 5-field cron expression. |

## Returns

[`CronExpression`](../interfaces/CronExpression.md)

Compiled representation usable by [nextCronFireAt](nextCronFireAt.md).

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the expression is malformed.
