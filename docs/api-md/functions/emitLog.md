[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / emitLog

# Function: emitLog()

```ts
function emitLog(logger, level, record): void;
```

Defined in: [src/logging/Logger.ts:93](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/Logger.ts#L93)

Emits a structured log record if the logger implements the requested level.

## Parameters

| Parameter | Type                                                        | Description                                               |
| --------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `logger`  | [`ZeroTransferLogger`](../interfaces/ZeroTransferLogger.md) | Logger that may contain a method for the requested level. |
| `level`   | [`LogLevel`](../type-aliases/LogLevel.md)                   | Severity level to emit.                                   |
| `record`  | [`LogRecordInput`](../interfaces/LogRecordInput.md)         | Log record fields without the level property.             |

## Returns

`void`

Nothing; missing logger methods are ignored.
