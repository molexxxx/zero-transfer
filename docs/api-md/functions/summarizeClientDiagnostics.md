[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / summarizeClientDiagnostics

# Function: summarizeClientDiagnostics()

```ts
function summarizeClientDiagnostics(client): ClientDiagnostics;
```

Defined in: [src/diagnostics/index.ts:40](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/diagnostics/index.ts#L40)

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
