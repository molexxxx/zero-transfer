[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactCommand

# Function: redactCommand()

```ts
function redactCommand(command): string;
```

Defined in: [src/logging/redaction.ts:31](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/logging/redaction.ts#L31)

Redacts sensitive FTP command payloads while preserving the command name.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `string` | Raw command text such as `PASS secret` or `USER deploy`. |

## Returns

`string`

Command text with secret arguments replaced by [REDACTED](../variables/REDACTED.md).
