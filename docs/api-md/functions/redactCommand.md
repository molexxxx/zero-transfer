[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactCommand

# Function: redactCommand()

```ts
function redactCommand(command): string;
```

Defined in: [src/logging/redaction.ts:31](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/logging/redaction.ts#L31)

Redacts sensitive FTP command payloads while preserving the command name.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `string` | Raw command text such as `PASS secret` or `USER deploy`. |

## Returns

`string`

Command text with secret arguments replaced by [REDACTED](../variables/REDACTED.md).
