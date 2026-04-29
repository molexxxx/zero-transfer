[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / serializeRemoteManifest

# Function: serializeRemoteManifest()

```ts
function serializeRemoteManifest(manifest, indent?): string;
```

Defined in: [src/sync/manifest.ts:139](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/sync/manifest.ts#L139)

Serializes a manifest to a JSON string suitable for persistence.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `manifest` | [`RemoteManifest`](../interfaces/RemoteManifest.md) | `undefined` | Manifest snapshot to serialize. |
| `indent` | `number` | `2` | Optional indentation passed to `JSON.stringify`. Defaults to `2`. |

## Returns

`string`

Stable JSON representation of the manifest.
