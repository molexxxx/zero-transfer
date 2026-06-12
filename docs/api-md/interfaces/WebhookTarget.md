[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WebhookTarget

# Interface: WebhookTarget

Defined in: [src/mft/webhooks.ts:19](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L19)

Webhook destination.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allowinsecureurl"></a> `allowInsecureUrl?` | `boolean` | Permits plain `http:` delivery. Defaults to `false`, which rejects cleartext URLs because audit payloads (and the HMAC timestamp/signature headers) would cross the network unencrypted. | [src/mft/webhooks.ts:33](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L33) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `string`\> | Additional headers merged into every request. | [src/mft/webhooks.ts:23](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L23) |
| <a id="secret"></a> `secret?` | `string` | Shared secret used to compute the HMAC signature header. | [src/mft/webhooks.ts:25](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L25) |
| <a id="types"></a> `types?` | readonly [`MftAuditEntryType`](../type-aliases/MftAuditEntryType.md)[] | Audit entry types to deliver. Defaults to all types. | [src/mft/webhooks.ts:27](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L27) |
| <a id="url"></a> `url` | `string` | Absolute `https:` URL that receives `POST` deliveries. | [src/mft/webhooks.ts:21](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/webhooks.ts#L21) |
