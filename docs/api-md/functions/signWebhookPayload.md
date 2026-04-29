[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / signWebhookPayload

# Function: signWebhookPayload()

```ts
function signWebhookPayload(
   payload, 
   secret, 
   timestamp?): WebhookSignature;
```

Defined in: [src/mft/webhooks.ts:82](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/mft/webhooks.ts#L82)

Computes the HMAC-SHA256 signature for a webhook payload.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `payload` | `string` | Raw JSON string of the webhook body. |
| `secret` | `string` | Shared secret. |
| `timestamp` | `string` | Optional fixed timestamp. Defaults to `new Date().toISOString()`. |

## Returns

[`WebhookSignature`](../interfaces/WebhookSignature.md)

The signature parts that should be included on the request.
