[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / TransferExecutionResult

# Interface: TransferExecutionResult

Defined in: [src/transfers/TransferJob.ts:77](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L77)

Result returned by a transfer operation implementation.

## Properties

| Property                                         | Type                                                          | Description                                                    | Defined in                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="bytestransferred"></a> `bytesTransferred` | `number`                                                      | Bytes transferred by the completed operation.                  | [src/transfers/TransferJob.ts:79](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L79) |
| <a id="checksum"></a> `checksum?`                | `string`                                                      | Optional checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:89](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L89) |
| <a id="resumed"></a> `resumed?`                  | `boolean`                                                     | Whether the operation resumed prior partial work.              | [src/transfers/TransferJob.ts:83](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L83) |
| <a id="totalbytes"></a> `totalBytes?`            | `number`                                                      | Total expected bytes when discovered during execution.         | [src/transfers/TransferJob.ts:81](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L81) |
| <a id="verification"></a> `verification?`        | [`TransferVerificationResult`](TransferVerificationResult.md) | Normalized post-transfer verification details.                 | [src/transfers/TransferJob.ts:87](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L87) |
| <a id="verified"></a> `verified?`                | `boolean`                                                     | Whether post-transfer verification completed successfully.     | [src/transfers/TransferJob.ts:85](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L85) |
| <a id="warnings"></a> `warnings?`                | `string`[]                                                    | Non-fatal warnings produced during execution.                  | [src/transfers/TransferJob.ts:91](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/transfers/TransferJob.ts#L91) |
