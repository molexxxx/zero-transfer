[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / UploadFileOptions

# Interface: UploadFileOptions

Defined in: [src/client/operations.ts:39](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L39)

Options for [uploadFile](../functions/uploadFile.md).

## Extends

- [`FriendlyTransferOptions`](../type-aliases/FriendlyTransferOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="bandwidthlimit"></a> `bandwidthLimit?` | [`TransferBandwidthLimit`](TransferBandwidthLimit.md) | Optional bandwidth limit forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`bandwidthLimit`](RunRouteOptions.md#bandwidthlimit) | [src/mft/runRoute.ts:52](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L52) |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client used to resolve both endpoint providers. | - | [src/client/operations.ts:41](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L41) |
| <a id="destination"></a> `destination` | [`RemoteFileEndpoint`](RemoteFileEndpoint.md) | Remote destination endpoint. | - | [src/client/operations.ts:45](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L45) |
| <a id="engine"></a> `engine?` | [`TransferEngine`](../classes/TransferEngine.md) | Optional transfer engine override. A fresh engine is created when omitted. | [`RunRouteOptions`](RunRouteOptions.md).[`engine`](RunRouteOptions.md#engine) | [src/mft/runRoute.ts:38](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L38) |
| <a id="jobid"></a> `jobId?` | `string` | Optional explicit job id. Defaults to a deterministic route-derived id. | [`RunRouteOptions`](RunRouteOptions.md).[`jobId`](RunRouteOptions.md#jobid) | [src/mft/runRoute.ts:40](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L40) |
| <a id="localpath"></a> `localPath` | `string` | Local source path. Relative paths are resolved against `process.cwd()`. | - | [src/client/operations.ts:43](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L43) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Caller-defined metadata merged into the resulting transfer job. | [`RunRouteOptions`](RunRouteOptions.md).[`metadata`](RunRouteOptions.md#metadata) | [src/mft/runRoute.ts:54](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L54) |
| <a id="now"></a> `now?` | () => `Date` | Optional clock used to derive the default job id. Defaults to `Date.now`. | [`RunRouteOptions`](RunRouteOptions.md).[`now`](RunRouteOptions.md#now) | [src/mft/runRoute.ts:42](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L42) |
| <a id="onprogress"></a> `onProgress?` | (`event`) => `void` | Progress observer forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`onProgress`](RunRouteOptions.md#onprogress) | [src/mft/runRoute.ts:48](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L48) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Retry policy forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`retry`](RunRouteOptions.md#retry) | [src/mft/runRoute.ts:46](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L46) |
| <a id="routeid"></a> `routeId?` | `string` | Stable route id assigned to the synthetic route. Defaults to `"upload:..."`, `"download:..."`, or `"copy:..."`. | `FriendlyTransferOptions.routeId` | [src/client/operations.ts:30](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L30) |
| <a id="routename"></a> `routeName?` | `string` | Optional human-readable route name forwarded to telemetry. | `FriendlyTransferOptions.routeName` | [src/client/operations.ts:32](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/client/operations.ts#L32) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal used to cancel the route execution. | [`RunRouteOptions`](RunRouteOptions.md).[`signal`](RunRouteOptions.md#signal) | [src/mft/runRoute.ts:44](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L44) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Timeout policy forwarded to the engine. | [`RunRouteOptions`](RunRouteOptions.md).[`timeout`](RunRouteOptions.md#timeout) | [src/mft/runRoute.ts:50](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/mft/runRoute.ts#L50) |
