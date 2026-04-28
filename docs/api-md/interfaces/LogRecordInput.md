[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / LogRecordInput

# Interface: LogRecordInput

Defined in: [src/logging/Logger.ts:45](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/Logger.ts#L45)

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

| Property                       | Type     | Description                     | Defined in                                                                                                                                      |
| ------------------------------ | -------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="message"></a> `message` | `string` | Human-readable summary message. | [src/logging/Logger.ts:47](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/logging/Logger.ts#L47) |
