[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseKnownHosts

# Function: parseKnownHosts()

```ts
function parseKnownHosts(text): KnownHostsEntry[];
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:39](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/KnownHostsParser.ts#L39)

Parses OpenSSH `known_hosts` content into structured entries. Comment and blank lines are skipped.
Lines that cannot be parsed are silently dropped so callers can tolerate hand-edited files.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Raw `known_hosts` file contents. |

## Returns

[`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[]

Parsed entries in source order.
