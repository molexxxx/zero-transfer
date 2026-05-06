[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / JsonlWriter

# Interface: JsonlWriter

Defined in: [src/mft/audit.ts:73](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/mft/audit.ts#L73)

Output sink consumed by [createJsonlAuditLog](../functions/createJsonlAuditLog.md).

## Methods

### write()

```ts
write(line): Promise<void>;
```

Defined in: [src/mft/audit.ts:75](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/mft/audit.ts#L75)

Writes a UTF-8 line that already includes a trailing newline.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `line` | `string` |

#### Returns

`Promise`\<`void`\>
