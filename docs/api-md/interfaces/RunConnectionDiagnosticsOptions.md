[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / RunConnectionDiagnosticsOptions

# Interface: RunConnectionDiagnosticsOptions

Defined in: [src/diagnostics/index.ts:78](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L78)

Options accepted by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="client"></a> `client` | [`TransferClient`](../classes/TransferClient.md) | Transfer client used to open the session. | [src/diagnostics/index.ts:80](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L80) |
| <a id="listpath"></a> `listPath?` | `string` | Path passed to the optional `fs.list` probe. Defaults to `"/"`. | [src/diagnostics/index.ts:84](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L84) |
| <a id="now"></a> `now?` | () => `number` | Optional clock injected for deterministic test timings. Defaults to `performance.now`. | [src/diagnostics/index.ts:90](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L90) |
| <a id="probelist"></a> `probeList?` | `boolean` | When `false`, skips the `fs.list` probe. Defaults to `true`. | [src/diagnostics/index.ts:86](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L86) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Connection profile to probe. | [src/diagnostics/index.ts:82](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L82) |
| <a id="samplesize"></a> `sampleSize?` | `number` | Maximum number of entries retained in the result sample. Defaults to `5`. | [src/diagnostics/index.ts:88](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/diagnostics/index.ts#L88) |
