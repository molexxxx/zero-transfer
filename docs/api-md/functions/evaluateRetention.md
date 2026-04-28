[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / evaluateRetention

# Function: evaluateRetention()

```ts
function evaluateRetention(options): RetentionEvaluation;
```

Defined in: [src/mft/retention.ts:63](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/retention.ts#L63)

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
