[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LogRecord

# Interface: LogRecord

Defined in: [src/logging/Logger.ts:15](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L15)

Complete structured log record emitted by ZeroTransfer helpers.

## Indexable

```ts
[key: string]: unknown
```

Additional structured fields supplied by adapters or services.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bytes"></a> `bytes?` | `number` | Byte count associated with the operation. | [src/logging/Logger.ts:37](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L37) |
| <a id="commandid"></a> `commandId?` | `string` | Correlation id for a protocol command. | [src/logging/Logger.ts:29](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L29) |
| <a id="component"></a> `component?` | `string` | SDK component that produced the record. | [src/logging/Logger.ts:21](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L21) |
| <a id="connectionid"></a> `connectionId?` | `string` | Correlation id for a connection lifecycle. | [src/logging/Logger.ts:27](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L27) |
| <a id="durationms"></a> `durationMs?` | `number` | Operation duration in milliseconds. | [src/logging/Logger.ts:35](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L35) |
| <a id="host"></a> `host?` | `string` | Remote host associated with the record. | [src/logging/Logger.ts:25](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L25) |
| <a id="level"></a> `level` | [`LogLevel`](../type-aliases/LogLevel.md) | Severity level for the record. | [src/logging/Logger.ts:17](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L17) |
| <a id="message"></a> `message` | `string` | Human-readable summary message. | [src/logging/Logger.ts:19](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L19) |
| <a id="path"></a> `path?` | `string` | Remote or local path associated with the record. | [src/logging/Logger.ts:33](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L33) |
| <a id="protocol"></a> `protocol?` | `string` | Active protocol for the record. | [src/logging/Logger.ts:23](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L23) |
| <a id="transferid"></a> `transferId?` | `string` | Correlation id for a transfer lifecycle. | [src/logging/Logger.ts:31](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/logging/Logger.ts#L31) |
