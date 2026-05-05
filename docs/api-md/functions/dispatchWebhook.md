[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / dispatchWebhook

# Function: dispatchWebhook()

```ts
function dispatchWebhook(options): Promise<DispatchWebhookResult>;
```

Defined in: [src/mft/webhooks.ts:98](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/webhooks.ts#L98)

Dispatches a single webhook payload with bounded retries.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DispatchWebhookOptions`](../interfaces/DispatchWebhookOptions.md) | Target, payload, fetch impl, retry policy, abort signal. |

## Returns

`Promise`\<[`DispatchWebhookResult`](../interfaces/DispatchWebhookResult.md)\>

The delivery outcome.
