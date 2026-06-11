[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / dispatchWebhook

# Function: dispatchWebhook()

```ts
function dispatchWebhook(options): Promise<DispatchWebhookResult>;
```

Defined in: [src/mft/webhooks.ts:106](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/webhooks.ts#L106)

Dispatches a single webhook payload with bounded retries.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DispatchWebhookOptions`](../interfaces/DispatchWebhookOptions.md) | Target, payload, fetch impl, retry policy, abort signal. |

## Returns

`Promise`\<[`DispatchWebhookResult`](../interfaces/DispatchWebhookResult.md)\>

The delivery outcome.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the target URL is not absolute or
uses cleartext `http:` without `allowInsecureUrl: true`.
