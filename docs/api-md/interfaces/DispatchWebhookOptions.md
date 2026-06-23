[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DispatchWebhookOptions

# Interface: DispatchWebhookOptions

Defined in: [src/mft/webhooks.ts:47](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L47)

Options accepted by [dispatchWebhook](../functions/dispatchWebhook.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fetch"></a> `fetch?` | (`input`, `init?`) => `Promise`\<`Response`\> | Optional fetch implementation. Defaults to the global `fetch`. | [src/mft/webhooks.ts:53](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L53) |
| <a id="payload"></a> `payload` | [`MftAuditEntry`](MftAuditEntry.md) | Audit entry payload to deliver. | [src/mft/webhooks.ts:51](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L51) |
| <a id="retry"></a> `retry?` | [`WebhookRetryPolicy`](WebhookRetryPolicy.md) | Retry policy override. | [src/mft/webhooks.ts:55](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L55) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal forwarded to fetch. | [src/mft/webhooks.ts:57](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L57) |
| <a id="sleep"></a> `sleep?` | (`delayMs`) => `Promise`\<`void`\> | Sleep used between retries. Defaults to `setTimeout`. | [src/mft/webhooks.ts:59](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L59) |
| <a id="target"></a> `target` | [`WebhookTarget`](WebhookTarget.md) | Webhook destination. | [src/mft/webhooks.ts:49](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/mft/webhooks.ts#L49) |
