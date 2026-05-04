[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LoggerMethod

# Type Alias: LoggerMethod

```ts
type LoggerMethod = (record, message?) => void;
```

Defined in: [src/logging/Logger.ts:56](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/logging/Logger.ts#L56)

Logger method signature used for each severity level.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `record` | [`LogRecord`](../interfaces/LogRecord.md) | Structured log record. |
| `message?` | `string` | Convenience message argument for console-like loggers. |

## Returns

`void`
