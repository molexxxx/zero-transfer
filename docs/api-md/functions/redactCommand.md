[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactCommand

# Function: redactCommand()

```ts
function redactCommand(command): string;
```

Defined in: [src/logging/redaction.ts:32](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/logging/redaction.ts#L32)

Redacts sensitive FTP command payloads while preserving the command name.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `string` | Raw command text such as `PASS secret` or `USER deploy`. |

## Returns

`string`

Command text with secret arguments replaced by [REDACTED](../variables/REDACTED.md).
