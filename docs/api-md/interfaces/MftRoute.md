[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftRoute

# Interface: MftRoute

Defined in: [src/mft/MftRoute.ts:34](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L34)

Declarative source→destination policy bound to provider profiles.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | Optional human-readable description. | [src/mft/MftRoute.ts:40](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L40) |
| <a id="destination"></a> `destination` | [`MftRouteEndpoint`](MftRouteEndpoint.md) | Destination endpoint resolved through the transfer client. | [src/mft/MftRoute.ts:44](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L44) |
| <a id="enabled"></a> `enabled?` | `boolean` | Whether the route is enabled. Defaults to `true`. | [src/mft/MftRoute.ts:50](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L50) |
| <a id="filter"></a> `filter?` | [`MftRouteFilter`](MftRouteFilter.md) | Optional include/exclude filter, reserved for tree-aware executors. | [src/mft/MftRoute.ts:46](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L46) |
| <a id="id"></a> `id` | `string` | Stable route identifier. | [src/mft/MftRoute.ts:36](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L36) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained for diagnostics and audit records. | [src/mft/MftRoute.ts:52](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L52) |
| <a id="name"></a> `name?` | `string` | Optional human-readable route name. | [src/mft/MftRoute.ts:38](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L38) |
| <a id="operation"></a> `operation?` | [`MftRouteOperation`](../type-aliases/MftRouteOperation.md) | Transfer operation performed by the route. Defaults to `"copy"`. | [src/mft/MftRoute.ts:48](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L48) |
| <a id="source"></a> `source` | [`MftRouteEndpoint`](MftRouteEndpoint.md) | Source endpoint resolved through the transfer client. | [src/mft/MftRoute.ts:42](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/MftRoute.ts#L42) |
