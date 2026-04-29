[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolveSecretOptions

# Interface: ResolveSecretOptions

Defined in: [src/profiles/SecretSource.ts:53](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/SecretSource.ts#L53)

Injectable dependencies used by tests or host applications during secret resolution.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="env"></a> `env?` | `ProcessEnv` | Environment source. Defaults to `process.env`. | [src/profiles/SecretSource.ts:55](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/SecretSource.ts#L55) |
| <a id="readfile"></a> `readFile?` | (`path`) => \| `Buffer`\<`ArrayBufferLike`\> \| `Promise`\<`Buffer`\<`ArrayBufferLike`\>\> | File reader. Defaults to `fs.promises.readFile`. | [src/profiles/SecretSource.ts:57](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/SecretSource.ts#L57) |
