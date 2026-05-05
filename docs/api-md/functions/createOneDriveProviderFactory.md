[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createOneDriveProviderFactory

# Function: createOneDriveProviderFactory()

```ts
function createOneDriveProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/cloud/OneDriveProvider.ts:136](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/cloud/OneDriveProvider.ts#L136)

Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph.

The bearer token is resolved per-connection from `profile.password`.
`profile.host` is unused. To target a SharePoint site or specific drive,
override `driveBaseUrl` with `https://graph.microsoft.com/v1.0/drives/{driveId}`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`OneDriveProviderOptions`](../interfaces/OneDriveProviderOptions.md) | Optional `driveBaseUrl`, `fetch`, and default headers. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Examples

```ts
import { createOneDriveProviderFactory, createTransferClient, uploadFile } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createOneDriveProviderFactory()],
});

await uploadFile({
  client,
  localPath: "./report.xlsx",
  destination: {
    path: "/Reports/Q2/report.xlsx",
    profile: {
      host: "",
      provider: "one-drive",
      password: { env: "GRAPH_ACCESS_TOKEN" },
    },
  },
});
```

```ts
createOneDriveProviderFactory({
  driveBaseUrl: "https://graph.microsoft.com/v1.0/drives/b!abc123",
});
```
