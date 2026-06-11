[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferRetryPolicy

# Interface: TransferRetryPolicy

Defined in: [src/transfers/TransferEngine.ts:65](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferEngine.ts#L65)

Retry policy for transfer execution.

Use [createDefaultRetryPolicy](../functions/createDefaultRetryPolicy.md) for a production-ready policy with
exponential backoff, full jitter, and `Retry-After` support, or implement
the hooks directly for full control.

## Methods

### getDelayMs()?

```ts
optional getDelayMs(input): number;
```

Defined in: [src/transfers/TransferEngine.ts:77](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferEngine.ts#L77)

Computes the delay before the next attempt in milliseconds.

The engine sleeps for the returned duration with an abort-aware timer:
cancelling the job during the delay rejects immediately instead of
waiting out the backoff. Non-positive or missing values retry at once.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`TransferRetryDecisionInput`](TransferRetryDecisionInput.md) |

#### Returns

`number`

***

### onRetry()?

```ts
optional onRetry(input): void;
```

Defined in: [src/transfers/TransferEngine.ts:79](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferEngine.ts#L79)

Observes retry decisions before the next attempt starts.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`TransferRetryDecisionInput`](TransferRetryDecisionInput.md) |

#### Returns

`void`

***

### shouldRetry()?

```ts
optional shouldRetry(input): boolean;
```

Defined in: [src/transfers/TransferEngine.ts:69](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferEngine.ts#L69)

Decides whether a failed attempt should be retried. Defaults to SDK retryability metadata.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`TransferRetryDecisionInput`](TransferRetryDecisionInput.md) |

#### Returns

`boolean`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="maxattempts"></a> `maxAttempts?` | `number` | Maximum total attempts, including the first attempt. Defaults to `1`. | [src/transfers/TransferEngine.ts:67](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/transfers/TransferEngine.ts#L67) |
