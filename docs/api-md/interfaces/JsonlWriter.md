[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / JsonlWriter

# Interface: JsonlWriter

Defined in: [src/mft/audit.ts:73](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/audit.ts#L73)

Output sink consumed by [createJsonlAuditLog](../functions/createJsonlAuditLog.md).

## Methods

### write()

```ts
write(line): Promise<void>;
```

Defined in: [src/mft/audit.ts:75](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/mft/audit.ts#L75)

Writes a UTF-8 line that already includes a trailing newline.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `line` | `string` |

#### Returns

`Promise`\<`void`\>
