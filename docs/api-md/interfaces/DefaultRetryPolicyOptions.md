[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DefaultRetryPolicyOptions

# Interface: DefaultRetryPolicyOptions

Defined in: [src/transfers/createDefaultRetryPolicy.ts:10](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L10)

Options for [createDefaultRetryPolicy](../functions/createDefaultRetryPolicy.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basedelayms"></a> `baseDelayMs?` | `number` | Base backoff delay before jitter in milliseconds. Defaults to `250`. | [src/transfers/createDefaultRetryPolicy.ts:14](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L14) |
| <a id="maxattempts"></a> `maxAttempts?` | `number` | Maximum total attempts, including the first attempt. Defaults to `4`. | [src/transfers/createDefaultRetryPolicy.ts:12](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L12) |
| <a id="maxdelayms"></a> `maxDelayMs?` | `number` | Upper bound for a single computed backoff delay in milliseconds. Defaults to `30_000`. | [src/transfers/createDefaultRetryPolicy.ts:16](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L16) |
| <a id="maxelapsedms"></a> `maxElapsedMs?` | `number` | Total elapsed-time budget across all attempts and delays in milliseconds. Once exceeded, no further retries are attempted. Defaults to `300_000` (5 minutes). | [src/transfers/createDefaultRetryPolicy.ts:21](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L21) |
| <a id="random"></a> `random?` | () => `number` | Random source in `[0, 1)` used for jitter. Defaults to `Math.random`. Inject a deterministic source in tests. | [src/transfers/createDefaultRetryPolicy.ts:26](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createDefaultRetryPolicy.ts#L26) |
