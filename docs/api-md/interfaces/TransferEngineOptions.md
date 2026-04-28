[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferEngineOptions

# Interface: TransferEngineOptions

Defined in: [src/transfers/TransferEngine.ts:81](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L81)

Construction options for deterministic tests and host integration.

## Properties

| Property                | Type         | Description                                                            | Defined in                                                                                                                                                          |
| ----------------------- | ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="now"></a> `now?` | () => `Date` | Clock used for receipts and progress events. Defaults to `new Date()`. | [src/transfers/TransferEngine.ts:83](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferEngine.ts#L83) |
