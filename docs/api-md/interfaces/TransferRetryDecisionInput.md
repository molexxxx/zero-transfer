[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferRetryDecisionInput

# Interface: TransferRetryDecisionInput

Defined in: [src/transfers/TransferEngine.ts:47](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L47)

Input used by retry policy hooks.

## Properties

| Property                       | Type                            | Description                           | Defined in                                                                                                                                                          |
| ------------------------------ | ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="attempt"></a> `attempt` | `number`                        | One-based attempt number that failed. | [src/transfers/TransferEngine.ts:51](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L51) |
| <a id="error"></a> `error`     | `unknown`                       | Error thrown by the failed attempt.   | [src/transfers/TransferEngine.ts:49](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L49) |
| <a id="job"></a> `job`         | [`TransferJob`](TransferJob.md) | Job being executed.                   | [src/transfers/TransferEngine.ts:53](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L53) |
