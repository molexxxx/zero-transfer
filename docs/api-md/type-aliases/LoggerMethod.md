[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / LoggerMethod

# Type Alias: LoggerMethod

```ts
type LoggerMethod = (record, message?) => void;
```

Defined in: [src/logging/Logger.ts:56](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/Logger.ts#L56)

Logger method signature used for each severity level.

## Parameters

| Parameter  | Type                                      | Description                                            |
| ---------- | ----------------------------------------- | ------------------------------------------------------ |
| `record`   | [`LogRecord`](../interfaces/LogRecord.md) | Structured log record.                                 |
| `message?` | `string`                                  | Convenience message argument for console-like loggers. |

## Returns

`void`
