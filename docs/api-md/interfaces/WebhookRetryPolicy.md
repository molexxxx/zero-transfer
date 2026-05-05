[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookRetryPolicy

# Interface: WebhookRetryPolicy

Defined in: [src/mft/webhooks.ts:31](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/webhooks.ts#L31)

Retry policy for webhook deliveries.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basedelayms"></a> `baseDelayMs?` | `number` | Base delay in milliseconds. Defaults to 250. | [src/mft/webhooks.ts:35](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/webhooks.ts#L35) |
| <a id="maxattempts"></a> `maxAttempts?` | `number` | Maximum number of attempts including the initial request. Defaults to 3. | [src/mft/webhooks.ts:33](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/webhooks.ts#L33) |
| <a id="maxdelayms"></a> `maxDelayMs?` | `number` | Maximum delay in milliseconds. Defaults to 5000. | [src/mft/webhooks.ts:37](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/webhooks.ts#L37) |
