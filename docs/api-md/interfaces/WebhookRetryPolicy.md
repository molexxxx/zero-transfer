[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookRetryPolicy

# Interface: WebhookRetryPolicy

Defined in: [src/mft/webhooks.ts:37](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/webhooks.ts#L37)

Retry policy for webhook deliveries.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basedelayms"></a> `baseDelayMs?` | `number` | Base delay in milliseconds. Defaults to 250. | [src/mft/webhooks.ts:41](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/webhooks.ts#L41) |
| <a id="maxattempts"></a> `maxAttempts?` | `number` | Maximum number of attempts including the initial request. Defaults to 3. | [src/mft/webhooks.ts:39](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/webhooks.ts#L39) |
| <a id="maxdelayms"></a> `maxDelayMs?` | `number` | Maximum delay in milliseconds. Defaults to 5000. | [src/mft/webhooks.ts:43](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/webhooks.ts#L43) |
