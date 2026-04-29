[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseKnownHosts

# Function: parseKnownHosts()

```ts
function parseKnownHosts(text): KnownHostsEntry[];
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:39](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/importers/KnownHostsParser.ts#L39)

Parses OpenSSH `known_hosts` content into structured entries. Comment and blank lines are skipped.
Lines that cannot be parsed are silently dropped so callers can tolerate hand-edited files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Raw `known_hosts` file contents. |

## Returns

[`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[]

Parsed entries in source order.
