[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeClientDiagnostics

# Function: summarizeClientDiagnostics()

```ts
function summarizeClientDiagnostics(client): ClientDiagnostics;
```

Defined in: [src/diagnostics/index.ts:40](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/diagnostics/index.ts#L40)

Returns a redaction-safe snapshot of the providers registered with a client.

Use this when rendering a setup screen, generating a support bundle, or
asserting in tests that the expected provider factories were registered.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client to inspect. |

## Returns

[`ClientDiagnostics`](../interfaces/ClientDiagnostics.md)

Provider id and capability snapshot tuples.

## Example

```ts
import { summarizeClientDiagnostics } from "@zero-transfer/sdk";

for (const { id, capabilities } of summarizeClientDiagnostics(client).providers) {
  console.log(`${id}: streaming=${capabilities.readStream} resume=${capabilities.resumeDownload}`);
}
```
