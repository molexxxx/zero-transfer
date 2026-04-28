[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / nextCronFireAt

# Function: nextCronFireAt()

```ts
function nextCronFireAt(expression, from, timezone?): Date | undefined;
```

Defined in: [src/mft/cron.ts:79](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/cron.ts#L79)

Computes the next time at which a cron expression fires strictly after `from`.

## Parameters

| Parameter    | Type                                                | Default value | Description                                       |
| ------------ | --------------------------------------------------- | ------------- | ------------------------------------------------- |
| `expression` | [`CronExpression`](../interfaces/CronExpression.md) | `undefined`   | Compiled cron expression.                         |
| `from`       | `Date`                                              | `undefined`   | Reference time.                                   |
| `timezone`   | `"local"` \| `"utc"`                                | `"utc"`       | Either `"utc"` or `"local"`. Defaults to `"utc"`. |

## Returns

`Date` \| `undefined`

The next fire time, or `undefined` when no fire occurs within five years.
