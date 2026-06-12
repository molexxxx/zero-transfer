[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferReceipt

# Interface: TransferReceipt

Defined in: [src/transfers/TransferJob.ts:155](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L155)

Audit-friendly receipt for a completed transfer job.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempts"></a> `attempts` | [`TransferAttempt`](TransferAttempt.md)[] | Attempt history, including retry failures. | [src/transfers/TransferJob.ts:187](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L187) |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/transfers/TransferJob.ts:177](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L177) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred by the successful operation. | [src/transfers/TransferJob.ts:167](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L167) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:185](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L185) |
| <a id="completedat"></a> `completedAt` | `Date` | Time the successful attempt completed. | [src/transfers/TransferJob.ts:173](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L173) |
| <a id="destination"></a> `destination?` | [`TransferEndpoint`](TransferEndpoint.md) | Destination endpoint when supplied by the job. | [src/transfers/TransferJob.ts:165](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L165) |
| <a id="durationms"></a> `durationMs` | `number` | Total elapsed time in milliseconds. | [src/transfers/TransferJob.ts:175](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L175) |
| <a id="jobid"></a> `jobId` | `string` | Original job identifier. | [src/transfers/TransferJob.ts:159](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L159) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained from the job. | [src/transfers/TransferJob.ts:191](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L191) |
| <a id="operation"></a> `operation` | [`TransferOperation`](../type-aliases/TransferOperation.md) | Operation performed by the job. | [src/transfers/TransferJob.ts:161](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L161) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed prior partial work. | [src/transfers/TransferJob.ts:179](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L179) |
| <a id="source"></a> `source?` | [`TransferEndpoint`](TransferEndpoint.md) | Source endpoint when supplied by the job. | [src/transfers/TransferJob.ts:163](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L163) |
| <a id="startedat"></a> `startedAt` | `Date` | Time the first attempt began. | [src/transfers/TransferJob.ts:171](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L171) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Expected total bytes when known. | [src/transfers/TransferJob.ts:169](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L169) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used for progress and log correlation. | [src/transfers/TransferJob.ts:157](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L157) |
| <a id="verification"></a> `verification?` | [`TransferVerificationResult`](TransferVerificationResult.md) | Normalized post-transfer verification details when supplied by the operation. | [src/transfers/TransferJob.ts:183](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L183) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/transfers/TransferJob.ts:181](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L181) |
| <a id="warnings"></a> `warnings` | `string`[] | Non-fatal warnings produced during execution. | [src/transfers/TransferJob.ts:189](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferJob.ts#L189) |
