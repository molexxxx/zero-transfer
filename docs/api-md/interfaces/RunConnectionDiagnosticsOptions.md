[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / RunConnectionDiagnosticsOptions

# Interface: RunConnectionDiagnosticsOptions

Defined in: [src/diagnostics/index.ts:66](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L66)

Options accepted by [runConnectionDiagnostics](../functions/runConnectionDiagnostics.md).

## Properties

| Property                              | Type                                             | Description                                                                            | Defined in                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="client"></a> `client`          | [`TransferClient`](../classes/TransferClient.md) | Transfer client used to open the session.                                              | [src/diagnostics/index.ts:68](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L68) |
| <a id="listpath"></a> `listPath?`     | `string`                                         | Path passed to the optional `fs.list` probe. Defaults to `"/"`.                        | [src/diagnostics/index.ts:72](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L72) |
| <a id="now"></a> `now?`               | () => `number`                                   | Optional clock injected for deterministic test timings. Defaults to `performance.now`. | [src/diagnostics/index.ts:78](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L78) |
| <a id="probelist"></a> `probeList?`   | `boolean`                                        | When `false`, skips the `fs.list` probe. Defaults to `true`.                           | [src/diagnostics/index.ts:74](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L74) |
| <a id="profile"></a> `profile`        | [`ConnectionProfile`](ConnectionProfile.md)      | Connection profile to probe.                                                           | [src/diagnostics/index.ts:70](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L70) |
| <a id="samplesize"></a> `sampleSize?` | `number`                                         | Maximum number of entries retained in the result sample. Defaults to `5`.              | [src/diagnostics/index.ts:76](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/diagnostics/index.ts#L76) |
