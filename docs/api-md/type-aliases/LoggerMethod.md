[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LoggerMethod

# Type Alias: LoggerMethod

```ts
type LoggerMethod = (record, message?) => void;
```

Defined in: [src/logging/Logger.ts:56](https://github.com/tonywied17/zero-transfer/blob/1389ffb013b0c2f9be4dc4d19fa0b4a7ab3a2441/src/logging/Logger.ts#L56)

Logger method signature used for each severity level.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `record` | [`LogRecord`](../interfaces/LogRecord.md) | Structured log record. |
| `message?` | `string` | Convenience message argument for console-like loggers. |

## Returns

`void`
