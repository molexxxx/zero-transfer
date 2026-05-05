[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / emitLog

# Function: emitLog()

```ts
function emitLog(
   logger, 
   level, 
   record): void;
```

Defined in: [src/logging/Logger.ts:93](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/logging/Logger.ts#L93)

Emits a structured log record if the logger implements the requested level.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `logger` | [`ZeroTransferLogger`](../interfaces/ZeroTransferLogger.md) | Logger that may contain a method for the requested level. |
| `level` | [`LogLevel`](../type-aliases/LogLevel.md) | Severity level to emit. |
| `record` | [`LogRecordInput`](../interfaces/LogRecordInput.md) | Log record fields without the level property. |

## Returns

`void`

Nothing; missing logger methods are ignored.
