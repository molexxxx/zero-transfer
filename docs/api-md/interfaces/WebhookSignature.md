[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookSignature

# Interface: WebhookSignature

Defined in: [src/mft/webhooks.ts:73](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L73)

Signature payload produced by [signWebhookPayload](../functions/signWebhookPayload.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="digest"></a> `digest` | `string` | Hex-encoded HMAC-SHA256 digest. | [src/mft/webhooks.ts:75](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L75) |
| <a id="timestamp"></a> `timestamp` | `string` | ISO-8601 timestamp included in the signed prefix. | [src/mft/webhooks.ts:77](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/mft/webhooks.ts#L77) |
