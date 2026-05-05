[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LoggerMethod

# Type Alias: LoggerMethod

```ts
type LoggerMethod = (record, message?) => void;
```

Defined in: [src/logging/Logger.ts:56](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/logging/Logger.ts#L56)

Logger method signature used for each severity level.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `record` | [`LogRecord`](../interfaces/LogRecord.md) | Structured log record. |
| `message?` | `string` | Convenience message argument for console-like loggers. |

## Returns

`void`
