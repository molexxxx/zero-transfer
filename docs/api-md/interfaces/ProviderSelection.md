[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderSelection

# Interface: ProviderSelection

Defined in: [src/core/ProviderId.ts:32](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/ProviderId.ts#L32)

Minimal shape used to resolve a provider from new and compatibility profile fields.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Compatibility protocol field accepted while the provider-neutral API rolls out. | [src/core/ProviderId.ts:36](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/ProviderId.ts#L36) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id for provider-neutral ZeroTransfer profiles. | [src/core/ProviderId.ts:34](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/ProviderId.ts#L34) |
