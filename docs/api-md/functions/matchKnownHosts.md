[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / matchKnownHosts

# Function: matchKnownHosts()

```ts
function matchKnownHosts(entries, host, port?): KnownHostsEntry[];
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:133](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/profiles/importers/KnownHostsParser.ts#L133)

Filters parsed entries down to those that match the given host/port. Negations are honored.

## Parameters

| Parameter | Type                                                             | Default value      | Description                                                  |
| --------- | ---------------------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| `entries` | readonly [`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[] | `undefined`        | Entries returned by [parseKnownHosts](parseKnownHosts.md).   |
| `host`    | `string`                                                         | `undefined`        | Hostname or IP literal to match.                             |
| `port`    | `number`                                                         | `DEFAULT_SSH_PORT` | Optional connection port. Defaults to [DEFAULT_SSH_PORT](#). |

## Returns

[`KnownHostsEntry`](../interfaces/KnownHostsEntry.md)[]

Matching entries in source order.
