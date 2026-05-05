[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runRoute

# Function: runRoute()

```ts
function runRoute(options): Promise<TransferReceipt>;
```

Defined in: [src/mft/runRoute.ts:96](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/runRoute.ts#L96)

Executes an MFT route as a single transfer through the supplied client.

Connects the source and destination profiles, runs the route's transfer
through the engine, and returns the resulting receipt. The friendly helpers
[uploadFile](uploadFile.md), [downloadFile](downloadFile.md), and [copyBetween](copyBetween.md) synthesize
routes and delegate to this function, so behaviour around retry, abort,
progress, timeout, and bandwidth limits is identical.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RunRouteOptions`](../interfaces/RunRouteOptions.md) | Client, route, and optional engine/abort/retry hooks. |

## Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt produced by the underlying transfer engine.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the route is disabled.

## Example

```ts
import { createTransferClient, runRoute, type MftRoute } from "@zero-transfer/sdk";

const route: MftRoute = {
  id: "nightly-export",
  operation: "copy",
  source: {
    path: "/exports/daily.csv",
    profile: { host: "sftp.example.com", provider: "sftp", username: "etl" },
  },
  destination: {
    path: "warehouse/daily.csv",
    profile: { host: "warehouse", provider: "s3", s3: { region: "us-east-1" } },
  },
};

const receipt = await runRoute({
  client,
  route,
  onProgress: (e) => console.log(`${e.bytesTransferred}/${e.totalBytes ?? "?"}`),
  retry: { maxAttempts: 3, baseDelayMs: 500 },
});
console.log(`Job ${receipt.jobId} moved ${receipt.bytesTransferred} bytes…`);
```
