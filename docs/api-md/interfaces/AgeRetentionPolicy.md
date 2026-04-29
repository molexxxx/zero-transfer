[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / AgeRetentionPolicy

# Interface: AgeRetentionPolicy

Defined in: [src/mft/retention.ts:15](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L15)

Retention policy that evicts entries older than `maxAgeMs`.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="kind"></a> `kind` | `"age"` | Discriminator. | [src/mft/retention.ts:17](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L17) |
| <a id="maxagems"></a> `maxAgeMs` | `number` | Maximum age before an entry is considered evictable. | [src/mft/retention.ts:19](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L19) |
