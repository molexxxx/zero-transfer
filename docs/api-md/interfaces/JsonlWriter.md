[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / JsonlWriter

# Interface: JsonlWriter

Defined in: [src/mft/audit.ts:73](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L73)

Output sink consumed by [createJsonlAuditLog](../functions/createJsonlAuditLog.md).

## Methods

### write()

```ts
write(line): Promise<void>;
```

Defined in: [src/mft/audit.ts:75](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/audit.ts#L75)

Writes a UTF-8 line that already includes a trailing newline.

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `line`    | `string` |

#### Returns

`Promise`\<`void`\>
