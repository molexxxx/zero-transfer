[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / LogRecordInput

# Interface: LogRecordInput

Defined in: [src/logging/Logger.ts:45](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/logging/Logger.ts#L45)

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
| <a id="message"></a> `message` | `string` | Human-readable summary message. | [src/logging/Logger.ts:47](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/logging/Logger.ts#L47) |
