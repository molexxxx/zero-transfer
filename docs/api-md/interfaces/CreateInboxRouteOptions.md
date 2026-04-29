[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateInboxRouteOptions

# Interface: CreateInboxRouteOptions

Defined in: [src/mft/conventions.ts:54](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L54)

Options accepted by [createInboxRoute](../functions/createInboxRoute.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | Optional human-friendly description. | [src/mft/conventions.ts:60](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L60) |
| <a id="destination"></a> `destination` | [`ConventionEndpoint`](ConventionEndpoint.md) | Destination endpoint that receives files from the inbox. | [src/mft/conventions.ts:64](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L64) |
| <a id="enabled"></a> `enabled?` | `boolean` | Whether the route is enabled. Defaults to `true`. | [src/mft/conventions.ts:68](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L68) |
| <a id="id"></a> `id` | `string` | Stable route id. | [src/mft/conventions.ts:56](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L56) |
| <a id="inbox"></a> `inbox` | [`MftInboxConvention`](MftInboxConvention.md) | Inbox convention. | [src/mft/conventions.ts:62](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L62) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the route. | [src/mft/conventions.ts:70](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L70) |
| <a id="name"></a> `name?` | `string` | Optional human-friendly route name. | [src/mft/conventions.ts:58](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L58) |
| <a id="operation"></a> `operation?` | [`MftRouteOperation`](../type-aliases/MftRouteOperation.md) | Optional operation override. Defaults to `"copy"`. | [src/mft/conventions.ts:66](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/conventions.ts#L66) |
