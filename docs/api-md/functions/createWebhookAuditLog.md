[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createWebhookAuditLog

# Function: createWebhookAuditLog()

```ts
function createWebhookAuditLog(options): MftAuditLog;
```

Defined in: [src/mft/webhooks.ts:191](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/webhooks.ts#L191)

Wraps a webhook target as an [MftAuditLog](../interfaces/MftAuditLog.md).

Entries whose `type` is not in `target.types` are silently dropped. `list()`
always returns an empty array because webhook deliveries are not buffered.
Payloads are HMAC-signed with `target.secret` (when provided) so receivers
can verify authenticity before acting on them.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateWebhookAuditLogOptions`](../interfaces/CreateWebhookAuditLogOptions.md) | Webhook target plus optional retry/observer hooks. |

## Returns

[`MftAuditLog`](../interfaces/MftAuditLog.md)

An audit log that delivers each `record` call to the webhook.

## Example

```ts
import {
  InMemoryAuditLog,
  composeAuditLogs,
  createWebhookAuditLog,
} from "@zero-transfer/sdk";

const memory = new InMemoryAuditLog();
const webhook = createWebhookAuditLog({
  target: {
    url: "https://hooks.example.com/zt",
    secret: { env: "ZT_WEBHOOK_SECRET" },
    types: ["transfer.success", "transfer.failure"],
  },
  onDelivery: ({ result }) => console.log("delivered", result.statusCode),
});

const audit = composeAuditLogs(memory, webhook);
await audit.record({ type: "transfer.success", receipt });
```
