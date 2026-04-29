[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CountRetentionPolicy

# Interface: CountRetentionPolicy

Defined in: [src/mft/retention.ts:23](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L23)

Retention policy that retains the newest `maxCount` entries.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="kind"></a> `kind` | `"count"` | Discriminator. | [src/mft/retention.ts:25](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L25) |
| <a id="maxcount"></a> `maxCount` | `number` | Maximum number of entries to retain. | [src/mft/retention.ts:27](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L27) |
| <a id="sortby"></a> `sortBy?` | `"name"` \| `"modifiedAt"` | Field used to rank entries from newest to oldest. Defaults to `"modifiedAt"`. `"name"` sorts lexicographically (descending). | [src/mft/retention.ts:32](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/mft/retention.ts#L32) |
