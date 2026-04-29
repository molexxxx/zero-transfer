[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookTarget

# Interface: WebhookTarget

Defined in: [src/mft/webhooks.ts:19](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/webhooks.ts#L19)

Webhook destination.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `string`\> | Additional headers merged into every request. | [src/mft/webhooks.ts:23](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/webhooks.ts#L23) |
| <a id="secret"></a> `secret?` | `string` | Shared secret used to compute the HMAC signature header. | [src/mft/webhooks.ts:25](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/webhooks.ts#L25) |
| <a id="types"></a> `types?` | readonly [`MftAuditEntryType`](../type-aliases/MftAuditEntryType.md)[] | Audit entry types to deliver. Defaults to all types. | [src/mft/webhooks.ts:27](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/webhooks.ts#L27) |
| <a id="url"></a> `url` | `string` | Absolute HTTP(S) URL that receives `POST` deliveries. | [src/mft/webhooks.ts:21](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/mft/webhooks.ts#L21) |
