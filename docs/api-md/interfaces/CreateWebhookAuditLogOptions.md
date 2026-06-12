[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateWebhookAuditLogOptions

# Interface: CreateWebhookAuditLogOptions

Defined in: [src/mft/webhooks.ts:153](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L153)

Options accepted by [createWebhookAuditLog](../functions/createWebhookAuditLog.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fetch"></a> `fetch?` | (`input`, `init?`) => `Promise`\<`Response`\> | Optional fetch implementation. | [src/mft/webhooks.ts:157](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L157) |
| <a id="ondelivery"></a> `onDelivery?` | (`input`) => `void` | Observer fired for every delivery attempt outcome. | [src/mft/webhooks.ts:163](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L163) |
| <a id="retry"></a> `retry?` | [`WebhookRetryPolicy`](WebhookRetryPolicy.md) | Retry policy override. | [src/mft/webhooks.ts:159](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L159) |
| <a id="sleep"></a> `sleep?` | (`delayMs`) => `Promise`\<`void`\> | Sleep used between retries. | [src/mft/webhooks.ts:161](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L161) |
| <a id="target"></a> `target` | [`WebhookTarget`](WebhookTarget.md) | Webhook destination. | [src/mft/webhooks.ts:155](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L155) |
