[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateWebhookAuditLogOptions

# Interface: CreateWebhookAuditLogOptions

Defined in: [src/mft/webhooks.ts:145](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L145)

Options accepted by [createWebhookAuditLog](../functions/createWebhookAuditLog.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fetch"></a> `fetch?` | (`input`, `init?`) => `Promise`\<`Response`\> | Optional fetch implementation. | [src/mft/webhooks.ts:149](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L149) |
| <a id="ondelivery"></a> `onDelivery?` | (`input`) => `void` | Observer fired for every delivery attempt outcome. | [src/mft/webhooks.ts:155](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L155) |
| <a id="retry"></a> `retry?` | [`WebhookRetryPolicy`](WebhookRetryPolicy.md) | Retry policy override. | [src/mft/webhooks.ts:151](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L151) |
| <a id="sleep"></a> `sleep?` | (`delayMs`) => `Promise`\<`void`\> | Sleep used between retries. | [src/mft/webhooks.ts:153](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L153) |
| <a id="target"></a> `target` | [`WebhookTarget`](WebhookTarget.md) | Webhook destination. | [src/mft/webhooks.ts:147](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/mft/webhooks.ts#L147) |
