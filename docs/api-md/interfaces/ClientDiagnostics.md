[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ClientDiagnostics

# Interface: ClientDiagnostics

Defined in: [src/diagnostics/index.ts:17](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L17)

Snapshot of the providers registered with a client.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="providers"></a> `providers` | readonly \{ `capabilities`: [`CapabilitySet`](CapabilitySet.md); `id`: [`ProviderId`](../type-aliases/ProviderId.md); \}[] | Providers currently registered, keyed by id. | [src/diagnostics/index.ts:19](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L19) |
