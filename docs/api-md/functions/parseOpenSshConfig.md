[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseOpenSshConfig

# Function: parseOpenSshConfig()

```ts
function parseOpenSshConfig(text): OpenSshConfigEntry[];
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/profiles/importers/OpenSshConfigImporter.ts#L29)

Parses OpenSSH `ssh_config` text into structured `Host` blocks.

The parser is intentionally permissive: unknown directives are retained and `Match` blocks are skipped.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Contents of the `ssh_config` file. |

## Returns

[`OpenSshConfigEntry`](../interfaces/OpenSshConfigEntry.md)[]

Parsed `Host` entries in source order.
