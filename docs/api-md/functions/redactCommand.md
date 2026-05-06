[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactCommand

# Function: redactCommand()

```ts
function redactCommand(command): string;
```

Defined in: [src/logging/redaction.ts:31](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/logging/redaction.ts#L31)

Redacts sensitive FTP command payloads while preserving the command name.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `string` | Raw command text such as `PASS secret` or `USER deploy`. |

## Returns

`string`

Command text with secret arguments replaced by [REDACTED](../variables/REDACTED.md).
