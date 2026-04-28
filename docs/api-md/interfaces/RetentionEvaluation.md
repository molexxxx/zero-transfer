[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RetentionEvaluation

# Interface: RetentionEvaluation

Defined in: [src/mft/retention.ts:39](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/retention.ts#L39)

Result returned by [evaluateRetention](../functions/evaluateRetention.md).

## Properties

| Property                   | Type                              | Description                      | Defined in                                                                                                                                    |
| -------------------------- | --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="evict"></a> `evict` | [`RemoteEntry`](RemoteEntry.md)[] | Entries selected for eviction.   | [src/mft/retention.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/retention.ts#L43) |
| <a id="keep"></a> `keep`   | [`RemoteEntry`](RemoteEntry.md)[] | Entries that should be retained. | [src/mft/retention.ts:41](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/retention.ts#L41) |
