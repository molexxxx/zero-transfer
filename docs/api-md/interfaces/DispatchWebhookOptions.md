[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DispatchWebhookOptions

# Interface: DispatchWebhookOptions

Defined in: [src/mft/webhooks.ts:41](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L41)

Options accepted by [dispatchWebhook](../functions/dispatchWebhook.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fetch"></a> `fetch?` | (`input`, `init?`) => `Promise`\<`Response`\> | Optional fetch implementation. Defaults to the global `fetch`. | [src/mft/webhooks.ts:47](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L47) |
| <a id="payload"></a> `payload` | [`MftAuditEntry`](MftAuditEntry.md) | Audit entry payload to deliver. | [src/mft/webhooks.ts:45](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L45) |
| <a id="retry"></a> `retry?` | [`WebhookRetryPolicy`](WebhookRetryPolicy.md) | Retry policy override. | [src/mft/webhooks.ts:49](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L49) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal forwarded to fetch. | [src/mft/webhooks.ts:51](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L51) |
| <a id="sleep"></a> `sleep?` | (`delayMs`) => `Promise`\<`void`\> | Sleep used between retries. Defaults to `setTimeout`. | [src/mft/webhooks.ts:53](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L53) |
| <a id="target"></a> `target` | [`WebhookTarget`](WebhookTarget.md) | Webhook destination. | [src/mft/webhooks.ts:43](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/webhooks.ts#L43) |
