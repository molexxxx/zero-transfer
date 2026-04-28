[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseOpenSshConfig

# Function: parseOpenSshConfig()

```ts
function parseOpenSshConfig(text): OpenSshConfigEntry[];
```

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/profiles/importers/OpenSshConfigImporter.ts#L29)

Parses OpenSSH `ssh_config` text into structured `Host` blocks.

The parser is intentionally permissive: unknown directives are retained and `Match` blocks are skipped.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Contents of the `ssh_config` file. |

## Returns

[`OpenSshConfigEntry`](../interfaces/OpenSshConfigEntry.md)[]

Parsed `Host` entries in source order.
