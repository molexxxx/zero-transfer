[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / dispatchWebhook

# Function: dispatchWebhook()

```ts
function dispatchWebhook(options): Promise<DispatchWebhookResult>;
```

Defined in: [src/mft/webhooks.ts:98](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/webhooks.ts#L98)

Dispatches a single webhook payload with bounded retries.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DispatchWebhookOptions`](../interfaces/DispatchWebhookOptions.md) | Target, payload, fetch impl, retry policy, abort signal. |

## Returns

`Promise`\<[`DispatchWebhookResult`](../interfaces/DispatchWebhookResult.md)\>

The delivery outcome.
