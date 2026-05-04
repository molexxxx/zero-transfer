[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runConnectionDiagnostics

# Function: runConnectionDiagnostics()

```ts
function runConnectionDiagnostics(options): Promise<ConnectionDiagnosticsResult>;
```

Defined in: [src/diagnostics/index.ts:87](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/diagnostics/index.ts#L87)

Connects to a profile, captures capability and listing samples, and returns a redaction-safe report.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RunConnectionDiagnosticsOptions`](../interfaces/RunConnectionDiagnosticsOptions.md) | Diagnostic probe options. |

## Returns

`Promise`\<[`ConnectionDiagnosticsResult`](../interfaces/ConnectionDiagnosticsResult.md)\>

Diagnostic report including timings and any captured error.
