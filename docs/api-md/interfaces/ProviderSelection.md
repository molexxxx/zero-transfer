[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ProviderSelection

# Interface: ProviderSelection

Defined in: [src/core/ProviderId.ts:32](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ProviderId.ts#L32)

Minimal shape used to resolve a provider from new and compatibility profile fields.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="protocol"></a> `protocol?` | `"ftp"` \| `"ftps"` \| `"sftp"` | Compatibility protocol field accepted while the provider-neutral API rolls out. | [src/core/ProviderId.ts:36](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ProviderId.ts#L36) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider id for provider-neutral ZeroTransfer profiles. | [src/core/ProviderId.ts:34](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/core/ProviderId.ts#L34) |
