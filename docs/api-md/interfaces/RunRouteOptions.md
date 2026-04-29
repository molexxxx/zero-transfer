[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RunRouteOptions

# Interface: RunRouteOptions

Defined in: [src/mft/runRoute.ts:32](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L32)

Options accepted by [runRoute](../functions/runRoute.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional bandwidth limit forwarded to the engine. | [src/mft/runRoute.ts:52](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L52) |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client whose registry can resolve both endpoint providers. | [src/mft/runRoute.ts:34](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L34) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Optional transfer engine override. A fresh engine is created when omitted. | [src/mft/runRoute.ts:38](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L38) |
| <a id="jobid"></a> `jobId?` | `string` | Optional explicit job id. Defaults to a deterministic route-derived id. | [src/mft/runRoute.ts:40](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L40) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the resulting transfer job. | [src/mft/runRoute.ts:54](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L54) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used to derive the default job id. Defaults to `Date.now`. | [src/mft/runRoute.ts:42](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L42) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer forwarded to the engine. | [src/mft/runRoute.ts:48](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L48) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy forwarded to the engine. | [src/mft/runRoute.ts:46](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L46) |
| <a id="route"></a> `route` | [`MftRoute`](MftRoute.md) | Route to execute. | [src/mft/runRoute.ts:36](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L36) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the route execution. | [src/mft/runRoute.ts:44](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L44) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy forwarded to the engine. | [src/mft/runRoute.ts:50](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/mft/runRoute.ts#L50) |
