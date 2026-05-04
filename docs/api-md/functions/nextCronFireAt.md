[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / nextCronFireAt

# Function: nextCronFireAt()

```ts
function nextCronFireAt(
   expression, 
   from, 
   timezone?): Date | undefined;
```

Defined in: [src/mft/cron.ts:79](https://github.com/tonywied17/zero-transfer/blob/3d3b2aaf54158384a7e5d156ab1f42706eb1f6fb/src/mft/cron.ts#L79)

Computes the next time at which a cron expression fires strictly after `from`.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `expression` | [`CronExpression`](../interfaces/CronExpression.md) | `undefined` | Compiled cron expression. |
| `from` | `Date` | `undefined` | Reference time. |
| `timezone` | `"local"` \| `"utc"` | `"utc"` | Either `"utc"` or `"local"`. Defaults to `"utc"`. |

## Returns

`Date` \| `undefined`

The next fire time, or `undefined` when no fire occurs within five years.
