[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebhookAuditLog

# Function: createWebhookAuditLog()

```ts
function createWebhookAuditLog(options): MftAuditLog;
```

Defined in: [src/mft/webhooks.ts:167](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/webhooks.ts#L167)

Wraps a webhook target as an [MftAuditLog](../interfaces/MftAuditLog.md).

Entries whose `type` is not in `target.types` are silently dropped. `list()`
always returns an empty array because webhook deliveries are not buffered.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateWebhookAuditLogOptions`](../interfaces/CreateWebhookAuditLogOptions.md) | Webhook target plus optional retry/observer hooks. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

An audit log that delivers each `record` call to the webhook.
