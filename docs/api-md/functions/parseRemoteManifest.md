[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseRemoteManifest

# Function: parseRemoteManifest()

```ts
function parseRemoteManifest(text): RemoteManifest;
```

Defined in: [src/sync/manifest.ts:150](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/sync/manifest.ts#L150)

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
