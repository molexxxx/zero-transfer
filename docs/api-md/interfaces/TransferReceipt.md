[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferReceipt

# Interface: TransferReceipt

Defined in: [src/transfers/TransferJob.ts:123](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L123)

Audit-friendly receipt for a completed transfer job.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempts"></a> `attempts` | [`TransferAttempt`](TransferAttempt.md)[] | Attempt history, including retry failures. | [src/transfers/TransferJob.ts:155](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L155) |
| <a id="averagebytespersecond"></a> `averageBytesPerSecond` | `number` | Average throughput in bytes per second. | [src/transfers/TransferJob.ts:145](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L145) |
| <a id="bytestransferred"></a> `bytesTransferred` | `number` | Total bytes transferred by the successful operation. | [src/transfers/TransferJob.ts:135](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L135) |
| <a id="checksum"></a> `checksum?` | `string` | Optional checksum value produced or verified by the operation. | [src/transfers/TransferJob.ts:153](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L153) |
| <a id="completedat"></a> `completedAt` | `Date` | Time the successful attempt completed. | [src/transfers/TransferJob.ts:141](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L141) |
| <a id="destination"></a> `destination?` | [`TransferEndpoint`](TransferEndpoint.md) | Destination endpoint when supplied by the job. | [src/transfers/TransferJob.ts:133](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L133) |
| <a id="durationms"></a> `durationMs` | `number` | Total elapsed time in milliseconds. | [src/transfers/TransferJob.ts:143](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L143) |
| <a id="jobid"></a> `jobId` | `string` | Original job identifier. | [src/transfers/TransferJob.ts:127](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L127) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata retained from the job. | [src/transfers/TransferJob.ts:159](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L159) |
| <a id="operation"></a> `operation` | [`TransferOperation`](../type-aliases/TransferOperation.md) | Operation performed by the job. | [src/transfers/TransferJob.ts:129](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L129) |
| <a id="resumed"></a> `resumed` | `boolean` | Whether the transfer resumed prior partial work. | [src/transfers/TransferJob.ts:147](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L147) |
| <a id="source"></a> `source?` | [`TransferEndpoint`](TransferEndpoint.md) | Source endpoint when supplied by the job. | [src/transfers/TransferJob.ts:131](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L131) |
| <a id="startedat"></a> `startedAt` | `Date` | Time the first attempt began. | [src/transfers/TransferJob.ts:139](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L139) |
| <a id="totalbytes"></a> `totalBytes?` | `number` | Expected total bytes when known. | [src/transfers/TransferJob.ts:137](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L137) |
| <a id="transferid"></a> `transferId` | `string` | Stable transfer identifier used for progress and log correlation. | [src/transfers/TransferJob.ts:125](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L125) |
| <a id="verification"></a> `verification?` | [`TransferVerificationResult`](TransferVerificationResult.md) | Normalized post-transfer verification details when supplied by the operation. | [src/transfers/TransferJob.ts:151](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L151) |
| <a id="verified"></a> `verified` | `boolean` | Whether post-transfer verification completed successfully. | [src/transfers/TransferJob.ts:149](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L149) |
| <a id="warnings"></a> `warnings` | `string`[] | Non-fatal warnings produced during execution. | [src/transfers/TransferJob.ts:157](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/transfers/TransferJob.ts#L157) |
