[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / matchKnownHostsEntry

# Function: matchKnownHostsEntry()

```ts
function matchKnownHostsEntry(
   entry, 
   host, 
   port?): boolean;
```

Defined in: [src/profiles/importers/KnownHostsParser.ts:105](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/KnownHostsParser.ts#L105)

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
