[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / BuiltinCapabilityMatrixEntry

# Interface: BuiltinCapabilityMatrixEntry

Defined in: [src/providers/capabilityMatrix.ts:35](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/capabilityMatrix.ts#L35)

Single entry in the built-in capability matrix.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities` | [`CapabilitySet`](CapabilitySet.md) | Capability snapshot advertised by the provider factory. | [src/providers/capabilityMatrix.ts:41](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/capabilityMatrix.ts#L41) |
| <a id="id"></a> `id` | [`BuiltinProviderMatrixId`](../type-aliases/BuiltinProviderMatrixId.md) | Stable matrix identifier (provider id, or `s3:multipart` for the multipart variant). | [src/providers/capabilityMatrix.ts:37](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/capabilityMatrix.ts#L37) |
| <a id="label"></a> `label` | `string` | Human-readable label, suitable for documentation tables. | [src/providers/capabilityMatrix.ts:39](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/capabilityMatrix.ts#L39) |
