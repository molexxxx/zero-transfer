[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AgeRetentionPolicy

# Interface: AgeRetentionPolicy

Defined in: [src/mft/retention.ts:15](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/retention.ts#L15)

Retention policy that evicts entries older than `maxAgeMs`.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="kind"></a> `kind` | `"age"` | Discriminator. | [src/mft/retention.ts:17](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/retention.ts#L17) |
| <a id="maxagems"></a> `maxAgeMs` | `number` | Maximum age before an entry is considered evictable. | [src/mft/retention.ts:19](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/mft/retention.ts#L19) |
