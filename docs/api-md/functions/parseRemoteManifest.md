[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseRemoteManifest

# Function: parseRemoteManifest()

```ts
function parseRemoteManifest(text): RemoteManifest;
```

Defined in: [src/sync/manifest.ts:150](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/sync/manifest.ts#L150)

Parses a JSON-encoded manifest, validating the schema version and entry shape.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | JSON payload produced by [serializeRemoteManifest](serializeRemoteManifest.md). |

## Returns

[`RemoteManifest`](../interfaces/RemoteManifest.md)

Parsed manifest snapshot.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the payload is invalid or has an unsupported version.
