[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferRetryPolicy

# Interface: TransferRetryPolicy

Defined in: [src/transfers/TransferEngine.ts:57](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L57)

Retry policy for transfer execution.

## Methods

### onRetry()?

```ts
optional onRetry(input): void;
```

Defined in: [src/transfers/TransferEngine.ts:63](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L63)

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

Defined in: [src/transfers/TransferEngine.ts:61](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L61)

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
| <a id="maxattempts"></a> `maxAttempts?` | `number` | Maximum total attempts, including the first attempt. Defaults to `1`. | [src/transfers/TransferEngine.ts:59](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L59) |
