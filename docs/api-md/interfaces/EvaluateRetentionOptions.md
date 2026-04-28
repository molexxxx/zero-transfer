[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / EvaluateRetentionOptions

# Interface: EvaluateRetentionOptions

Defined in: [src/mft/retention.ts:47](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/retention.ts#L47)

Options accepted by [evaluateRetention](../functions/evaluateRetention.md).

## Properties

| Property                       | Type                                                    | Description                                                                 | Defined in                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="entries"></a> `entries` | readonly [`RemoteEntry`](RemoteEntry.md)[]              | Listing to evaluate. Directories and symlinks are passed through unchanged. | [src/mft/retention.ts:49](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/retention.ts#L49) |
| <a id="now"></a> `now?`        | `Date`                                                  | Reference time used by age policies. Defaults to `new Date()`.              | [src/mft/retention.ts:53](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/retention.ts#L53) |
| <a id="policy"></a> `policy`   | [`RetentionPolicy`](../type-aliases/RetentionPolicy.md) | Policy to apply.                                                            | [src/mft/retention.ts:51](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/mft/retention.ts#L51) |
