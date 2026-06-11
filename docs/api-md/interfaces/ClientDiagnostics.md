[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ClientDiagnostics

# Interface: ClientDiagnostics

Defined in: [src/diagnostics/index.ts:17](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/diagnostics/index.ts#L17)

Snapshot of the providers registered with a client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="providers"></a> `providers` | readonly \{ `capabilities`: [`CapabilitySet`](CapabilitySet.md); `id`: [`ProviderId`](../type-aliases/ProviderId.md); \}[] | Providers currently registered, keyed by id. | [src/diagnostics/index.ts:19](https://github.com/tonywied17/zero-transfer/blob/032c9e1827a8094533bf65e161bbb7d390b93de3/src/diagnostics/index.ts#L19) |
