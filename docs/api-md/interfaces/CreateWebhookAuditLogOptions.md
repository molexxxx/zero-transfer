[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateWebhookAuditLogOptions

# Interface: CreateWebhookAuditLogOptions

Defined in: [src/mft/webhooks.ts:153](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L153)

Options accepted by [createWebhookAuditLog](../functions/createWebhookAuditLog.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fetch"></a> `fetch?` | (`input`, `init?`) => `Promise`\<`Response`\> | Optional fetch implementation. | [src/mft/webhooks.ts:157](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L157) |
| <a id="ondelivery"></a> `onDelivery?` | (`input`) => `void` | Observer fired for every delivery attempt outcome. | [src/mft/webhooks.ts:163](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L163) |
| <a id="retry"></a> `retry?` | [`WebhookRetryPolicy`](WebhookRetryPolicy.md) | Retry policy override. | [src/mft/webhooks.ts:159](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L159) |
| <a id="sleep"></a> `sleep?` | (`delayMs`) => `Promise`\<`void`\> | Sleep used between retries. | [src/mft/webhooks.ts:161](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L161) |
| <a id="target"></a> `target` | [`WebhookTarget`](WebhookTarget.md) | Webhook destination. | [src/mft/webhooks.ts:155](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L155) |
