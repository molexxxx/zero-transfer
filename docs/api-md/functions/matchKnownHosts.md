[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / matchKnownHosts

# Function: matchKnownHosts()

```ts
function matchKnownHosts(
   entries, 
   host, 
   port?): KnownHostsEntry[];
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:133](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/profiles/importers/KnownHostsParser.ts#L133)

Filters parsed entries down to those that match the given host/port. Negations are honored.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `entries` | readonly [`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[] | `undefined` | Entries returned by [parseKnownHosts](parseKnownHosts.md). |
| `host` | `string` | `undefined` | Hostname or IP literal to match. |
| `port` | `number` | `DEFAULT_SSH_PORT` | Optional connection port. Defaults to [DEFAULT\_SSH\_PORT](#). |

## Returns

[`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[]

Matching entries in source order.
