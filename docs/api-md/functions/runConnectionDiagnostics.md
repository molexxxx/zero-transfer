[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / runConnectionDiagnostics

# Function: runConnectionDiagnostics()

```ts
function runConnectionDiagnostics(options): Promise<ConnectionDiagnosticsResult>;
```

Defined in: [src/diagnostics/index.ts:87](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L87)

Connects to a profile, captures capability and listing samples, and returns a redaction-safe report.

## Parameters

| Parameter | Type                                                                                  | Description               |
| --------- | ------------------------------------------------------------------------------------- | ------------------------- |
| `options` | [`RunConnectionDiagnosticsOptions`](../interfaces/RunConnectionDiagnosticsOptions.md) | Diagnostic probe options. |

## Returns

`Promise`\<[`ConnectionDiagnosticsResult`](../interfaces/ConnectionDiagnosticsResult.md)\>

Diagnostic report including timings and any captured error.
