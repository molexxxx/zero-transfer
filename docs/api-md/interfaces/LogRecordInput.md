[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LogRecordInput

# Interface: LogRecordInput

Defined in: [src/logging/Logger.ts:45](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/logging/Logger.ts#L45)

Log record input accepted by [emitLog](../functions/emitLog.md); the helper adds the level.

## Extends

- `Omit`\<[`LogRecord`](LogRecord.md), `"level"`\>

## Indexable

```ts
[key: string]: unknown
```

```ts
[key: number]: unknown
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="message"></a> `message` | `string` | Human-readable summary message. | [src/logging/Logger.ts:47](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/logging/Logger.ts#L47) |
