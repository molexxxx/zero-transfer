[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runConnectionDiagnostics

# Function: runConnectionDiagnostics()

```ts
function runConnectionDiagnostics(options): Promise<ConnectionDiagnosticsResult>;
```

Defined in: [src/diagnostics/index.ts:127](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/diagnostics/index.ts#L127)

Connects to a profile, captures capability and listing samples, and returns a redaction-safe report.

Useful for connectivity "ping" pages, smoke tests, and bug reports. Secrets
in the profile are redacted via [redactConnectionProfile](redactConnectionProfile.md) before being
returned. The session is always disconnected before the function returns,
including when probes throw.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RunConnectionDiagnosticsOptions`](../interfaces/RunConnectionDiagnosticsOptions.md) | Diagnostic probe options. |

## Returns

`Promise`\<[`ConnectionDiagnosticsResult`](../interfaces/ConnectionDiagnosticsResult.md)\>

Diagnostic report including timings and any captured error.

## Example

```ts
import { runConnectionDiagnostics } from "@zero-transfer/sdk";

const report = await runConnectionDiagnostics({
  client,
  profile: {
    host: "sftp.example.com",
    provider: "sftp",
    username: "deploy",
    ssh: { privateKey: { path: "./keys/id_ed25519" } },
  },
  listPath: "/uploads",
});

if (!report.ok) {
  console.error("connection failed:", report.error);
} else {
  console.log(`connect=${report.timings.connectMs}ms list=${report.timings.listMs}ms`);
  console.log(report.sample); // up to 5 entries from /uploads
}
```
