[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / DownloadFileOptions

# Interface: DownloadFileOptions

Defined in: [src/client/operations.ts:96](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L96)

Options for [downloadFile](../functions/downloadFile.md).

## Extends

- [`FriendlyTransferOptions`](../type-aliases/FriendlyTransferOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional bandwidth limit forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`bandwidthLimit`](RunRouteOptions.md#bandwidthlimit) | [src/mft/runRoute.ts:55](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L55) |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client used to resolve both endpoint providers. | - | [src/client/operations.ts:98](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L98) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Optional transfer engine override. A fresh engine is created when omitted. | [`RunRouteOptions`](RunRouteOptions.md).[`engine`](RunRouteOptions.md#engine) | [src/mft/runRoute.ts:41](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L41) |
| <a id="jobid"></a> `jobId?` | `string` | Optional explicit job id. Defaults to a deterministic route-derived id. | [`RunRouteOptions`](RunRouteOptions.md).[`jobId`](RunRouteOptions.md#jobid) | [src/mft/runRoute.ts:43](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L43) |
| <a id="localpath"></a> `localPath` | `string` | Local destination path. Relative paths are resolved against `process.cwd()`. | - | [src/client/operations.ts:102](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L102) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the resulting transfer job. | [`RunRouteOptions`](RunRouteOptions.md).[`metadata`](RunRouteOptions.md#metadata) | [src/mft/runRoute.ts:59](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L59) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used to derive the default job id. Defaults to `Date.now`. | [`RunRouteOptions`](RunRouteOptions.md).[`now`](RunRouteOptions.md#now) | [src/mft/runRoute.ts:45](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L45) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`onProgress`](RunRouteOptions.md#onprogress) | [src/mft/runRoute.ts:51](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L51) |
| <a id="resume"></a> `resume?` | [`TransferResumeOptions`](TransferResumeOptions.md) | Checkpoint/resume configuration forwarded to the executor. Falls back to `client.defaults.resume`. | [`RunRouteOptions`](RunRouteOptions.md).[`resume`](RunRouteOptions.md#resume) | [src/mft/runRoute.ts:57](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L57) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy forwarded to the engine. Falls back to `client.defaults.retry`. | [`RunRouteOptions`](RunRouteOptions.md).[`retry`](RunRouteOptions.md#retry) | [src/mft/runRoute.ts:49](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L49) |
| <a id="routeid"></a> `routeId?` | `string` | Stable route id assigned to the synthetic route. Defaults to `"upload:..."`, `"download:..."`, or `"copy:..."`. | `FriendlyTransferOptions.routeId` | [src/client/operations.ts:30](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L30) |
| <a id="routename"></a> `routeName?` | `string` | Optional human-readable route name forwarded to telemetry. | `FriendlyTransferOptions.routeName` | [src/client/operations.ts:32](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L32) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the route execution. | [`RunRouteOptions`](RunRouteOptions.md).[`signal`](RunRouteOptions.md#signal) | [src/mft/runRoute.ts:47](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L47) |
| <a id="source"></a> `source` | [`RemoteFileEndpoint`](RemoteFileEndpoint.md) | Remote source endpoint. | - | [src/client/operations.ts:100](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/client/operations.ts#L100) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy forwarded to the engine. Falls back to `client.defaults.timeout`. | [`RunRouteOptions`](RunRouteOptions.md).[`timeout`](RunRouteOptions.md#timeout) | [src/mft/runRoute.ts:53](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/mft/runRoute.ts#L53) |
