[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ClientDiagnostics

# Interface: ClientDiagnostics

Defined in: [src/diagnostics/index.ts:17](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/diagnostics/index.ts#L17)

Snapshot of the providers registered with a client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="providers"></a> `providers` | readonly \{ `capabilities`: [`CapabilitySet`](CapabilitySet.md); `id`: [`ProviderId`](../type-aliases/ProviderId.md); \}[] | Providers currently registered, keyed by id. | [src/diagnostics/index.ts:19](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/diagnostics/index.ts#L19) |
