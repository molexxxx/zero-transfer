[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BuiltinCapabilityMatrixEntry

# Interface: BuiltinCapabilityMatrixEntry

Defined in: [src/providers/capabilityMatrix.ts:36](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/capabilityMatrix.ts#L36)

Single entry in the built-in capability matrix.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities` | [`CapabilitySet`](CapabilitySet.md) | Capability snapshot advertised by the provider factory. | [src/providers/capabilityMatrix.ts:42](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/capabilityMatrix.ts#L42) |
| <a id="id"></a> `id` | [`BuiltinProviderMatrixId`](../type-aliases/BuiltinProviderMatrixId.md) | Stable matrix identifier (provider id, or `s3:single-shot` for the legacy variant). | [src/providers/capabilityMatrix.ts:38](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/capabilityMatrix.ts#L38) |
| <a id="label"></a> `label` | `string` | Human-readable label, suitable for documentation tables. | [src/providers/capabilityMatrix.ts:40](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/capabilityMatrix.ts#L40) |
