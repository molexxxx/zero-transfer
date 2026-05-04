[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / matchKnownHosts

# Function: matchKnownHosts()

```ts
function matchKnownHosts(
   entries, 
   host, 
   port?): KnownHostsEntry[];
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:133](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/KnownHostsParser.ts#L133)

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
