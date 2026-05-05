[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ConnectionDiagnosticsResult

# Interface: ConnectionDiagnosticsResult

Defined in: [src/diagnostics/index.ts:58](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L58)

Result returned by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="capabilities"></a> `capabilities?` | [`CapabilitySet`](CapabilitySet.md) | Capability snapshot reported by the connected session. | [src/diagnostics/index.ts:64](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L64) |
| <a id="error"></a> `error?` | \{ `code?`: `string`; `message`: `string`; `name?`: `string`; \} | Captured error summary when the diagnostics could not complete. | [src/diagnostics/index.ts:74](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L74) |
| `error.code?` | `string` | - | [src/diagnostics/index.ts:74](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L74) |
| `error.message` | `string` | - | [src/diagnostics/index.ts:74](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L74) |
| `error.name?` | `string` | - | [src/diagnostics/index.ts:74](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L74) |
| <a id="host"></a> `host` | `string` | Profile host (after redaction). | [src/diagnostics/index.ts:62](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L62) |
| <a id="ok"></a> `ok` | `boolean` | Whether all probes ran without throwing. | [src/diagnostics/index.ts:72](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L72) |
| <a id="provider"></a> `provider?` | [`ProviderId`](../type-aliases/ProviderId.md) | Resolved provider id used to open the session. | [src/diagnostics/index.ts:60](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L60) |
| <a id="redactedprofile"></a> `redactedProfile` | `Record`\<`string`, `unknown`\> | Redacted connection profile mirroring [redactConnectionProfile](../functions/redactConnectionProfile.md). | [src/diagnostics/index.ts:66](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L66) |
| <a id="sample"></a> `sample?` | readonly [`RemoteEntry`](RemoteEntry.md)[] | Sample of entries returned by the optional `fs.list` probe. | [src/diagnostics/index.ts:70](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L70) |
| <a id="timings"></a> `timings` | [`ConnectionDiagnosticTimings`](ConnectionDiagnosticTimings.md) | Per-step duration measurements. | [src/diagnostics/index.ts:68](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L68) |
