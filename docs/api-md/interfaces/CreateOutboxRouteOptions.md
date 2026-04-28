[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CreateOutboxRouteOptions

# Interface: CreateOutboxRouteOptions

Defined in: [src/mft/conventions.ts:74](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L74)

Options accepted by [createOutboxRoute](../functions/createOutboxRoute.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | Optional human-friendly description. | [src/mft/conventions.ts:80](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L80) |
| <a id="enabled"></a> `enabled?` | `boolean` | Whether the route is enabled. Defaults to `true`. | [src/mft/conventions.ts:88](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L88) |
| <a id="id"></a> `id` | `string` | Stable route id. | [src/mft/conventions.ts:76](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L76) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the route. | [src/mft/conventions.ts:90](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L90) |
| <a id="name"></a> `name?` | `string` | Optional human-friendly route name. | [src/mft/conventions.ts:78](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L78) |
| <a id="operation"></a> `operation?` | [`MftRouteOperation`](../type-aliases/MftRouteOperation.md) | Optional operation override. Defaults to `"copy"`. | [src/mft/conventions.ts:86](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L86) |
| <a id="outbox"></a> `outbox` | [`MftOutboxConvention`](MftOutboxConvention.md) | Outbox convention. | [src/mft/conventions.ts:84](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L84) |
| <a id="source"></a> `source` | [`ConventionEndpoint`](ConventionEndpoint.md) | Source endpoint that supplies files into the outbox. | [src/mft/conventions.ts:82](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/conventions.ts#L82) |
