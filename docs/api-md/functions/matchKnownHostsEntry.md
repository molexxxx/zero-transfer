[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / matchKnownHostsEntry

# Function: matchKnownHostsEntry()

```ts
function matchKnownHostsEntry(
   entry, 
   host, 
   port?): boolean;
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:105](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/KnownHostsParser.ts#L105)

Returns true when the given host (and optional port) matches the entry's host patterns.
Hashed entries use HMAC-SHA1 verification per OpenSSH semantics.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `entry` | [`KnownHostsEntry`](../interfaces/KnownHostsEntry.md) | `undefined` | Parsed `known_hosts` entry to test. |
| `host` | `string` | `undefined` | Hostname or IP literal to match. |
| `port` | `number` | `DEFAULT_SSH_PORT` | Optional connection port. Defaults to [DEFAULT\_SSH\_PORT](#). |

## Returns

`boolean`

Whether the entry matches and is not negated.
