[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / evaluateRetention

# Function: evaluateRetention()

```ts
function evaluateRetention(options): RetentionEvaluation;
```

Defined in: [src/mft/retention.ts:63](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/retention.ts#L63)

Splits a listing into retained and evictable entries according to a policy.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`EvaluateRetentionOptions`](../interfaces/EvaluateRetentionOptions.md) | Listing, policy, and optional reference clock. |

## Returns

[`RetentionEvaluation`](../interfaces/RetentionEvaluation.md)

The keep/evict split.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the policy is malformed.
