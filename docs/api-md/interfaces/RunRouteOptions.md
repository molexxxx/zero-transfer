[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RunRouteOptions

# Interface: RunRouteOptions

Defined in: [src/mft/runRoute.ts:35](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L35)

Options accepted by [runRoute](../functions/runRoute.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional bandwidth limit forwarded to the engine. | [src/mft/runRoute.ts:55](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L55) |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client whose registry can resolve both endpoint providers. | [src/mft/runRoute.ts:37](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L37) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Optional transfer engine override. A fresh engine is created when omitted. | [src/mft/runRoute.ts:41](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L41) |
| <a id="jobid"></a> `jobId?` | `string` | Optional explicit job id. Defaults to a deterministic route-derived id. | [src/mft/runRoute.ts:43](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L43) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the resulting transfer job. | [src/mft/runRoute.ts:59](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L59) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used to derive the default job id. Defaults to `Date.now`. | [src/mft/runRoute.ts:45](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L45) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer forwarded to the engine. | [src/mft/runRoute.ts:51](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L51) |
| <a id="resume"></a> `resume?` | [`TransferResumeOptions`](TransferResumeOptions.md) | Checkpoint/resume configuration forwarded to the executor. Falls back to `client.defaults.resume`. | [src/mft/runRoute.ts:57](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L57) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy forwarded to the engine. Falls back to `client.defaults.retry`. | [src/mft/runRoute.ts:49](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L49) |
| <a id="route"></a> `route` | [`MftRoute`](MftRoute.md) | Route to execute. | [src/mft/runRoute.ts:39](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L39) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the route execution. | [src/mft/runRoute.ts:47](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L47) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy forwarded to the engine. Falls back to `client.defaults.timeout`. | [src/mft/runRoute.ts:53](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/mft/runRoute.ts#L53) |
