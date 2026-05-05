[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ClientDiagnostics

# Interface: ClientDiagnostics

Defined in: [src/diagnostics/index.ts:17](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L17)

Snapshot of the providers registered with a client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="providers"></a> `providers` | readonly \{ `capabilities`: [`CapabilitySet`](CapabilitySet.md); `id`: [`ProviderId`](../type-aliases/ProviderId.md); \}[] | Providers currently registered, keyed by id. | [src/diagnostics/index.ts:19](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/diagnostics/index.ts#L19) |
