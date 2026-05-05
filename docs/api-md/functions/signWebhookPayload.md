[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / signWebhookPayload

# Function: signWebhookPayload()

```ts
function signWebhookPayload(
   payload, 
   secret, 
   timestamp?): WebhookSignature;
```

Defined in: [src/mft/webhooks.ts:82](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/webhooks.ts#L82)

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
