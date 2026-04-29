[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookSignature

# Interface: WebhookSignature

Defined in: [src/mft/webhooks.ts:67](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/webhooks.ts#L67)

Signature payload produced by [signWebhookPayload](../functions/signWebhookPayload.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="digest"></a> `digest` | `string` | Hex-encoded HMAC-SHA256 digest. | [src/mft/webhooks.ts:69](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/webhooks.ts#L69) |
| <a id="timestamp"></a> `timestamp` | `string` | ISO-8601 timestamp included in the signed prefix. | [src/mft/webhooks.ts:71](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/webhooks.ts#L71) |
