[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticsResult

# Interface: ConnectionDiagnosticsResult

Defined in: [src/diagnostics/index.ts:46](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L46)

Result returned by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities?` | [`CapabilitySet`](CapabilitySet.md) | Capability snapshot reported by the connected session. | [src/diagnostics/index.ts:52](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L52) |
| <a id="error"></a> `error?` | \{ `code?`: `string`; `message`: `string`; `name?`: `string`; \} | Captured error summary when the diagnostics could not complete. | [src/diagnostics/index.ts:62](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L62) |
| `error.code?` | `string` | - | [src/diagnostics/index.ts:62](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L62) |
| `error.message` | `string` | - | [src/diagnostics/index.ts:62](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L62) |
| `error.name?` | `string` | - | [src/diagnostics/index.ts:62](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L62) |
| <a id="host"></a> `host` | `string` | Profile host (after redaction). | [src/diagnostics/index.ts:50](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L50) |
| <a id="ok"></a> `ok` | `boolean` | Whether all probes ran without throwing. | [src/diagnostics/index.ts:60](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L60) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Resolved provider id used to open the session. | [src/diagnostics/index.ts:48](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L48) |
| <a id="redactedprofile"></a> `redactedProfile` | `Record`\<`string`, `unknown`\> | Redacted connection profile mirroring [redactConnectionProfile](../functions/redactConnectionProfile.md). | [src/diagnostics/index.ts:54](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L54) |
| <a id="sample"></a> `sample?` | readonly [`RemoteEntry`](RemoteEntry.md)[] | Sample of entries returned by the optional `fs.list` probe. | [src/diagnostics/index.ts:58](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L58) |
| <a id="timings"></a> `timings` | [`ConnectionDiagnosticTimings`](ConnectionDiagnosticTimings.md) | Per-step duration measurements. | [src/diagnostics/index.ts:56](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/diagnostics/index.ts#L56) |
