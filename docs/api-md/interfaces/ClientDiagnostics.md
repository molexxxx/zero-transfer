[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / ClientDiagnostics

# Interface: ClientDiagnostics

Defined in: [src/diagnostics/index.ts:17](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/diagnostics/index.ts#L17)

Snapshot of the providers registered with a client.

## Properties

| Property                           | Type                                                                                                                       | Description                                  | Defined in                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="providers"></a> `providers` | readonly \{ `capabilities`: [`CapabilitySet`](CapabilitySet.md); `id`: [`ProviderId`](../type-aliases/ProviderId.md); \}[] | Providers currently registered, keyed by id. | [src/diagnostics/index.ts:19](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/diagnostics/index.ts#L19) |
