[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CompareRemoteManifestsOptions

# Interface: CompareRemoteManifestsOptions

Defined in: [src/sync/manifest.ts:79](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L79)

Options accepted by [compareRemoteManifests](../functions/compareRemoteManifests.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="comparemodifiedat"></a> `compareModifiedAt?` | `boolean` | Whether modification timestamps participate in the comparison. Defaults to `true`. | [src/sync/manifest.ts:85](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L85) |
| <a id="comparesize"></a> `compareSize?` | `boolean` | Whether sizes participate in the comparison. Defaults to `true`. | [src/sync/manifest.ts:87](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L87) |
| <a id="compareuniqueid"></a> `compareUniqueId?` | `boolean` | Whether to require matching `uniqueId` checksums when both entries expose one. Defaults to `false`. | [src/sync/manifest.ts:89](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L89) |
| <a id="includeunchanged"></a> `includeUnchanged?` | `boolean` | Whether unchanged entries are included in the result. Defaults to `false`. | [src/sync/manifest.ts:81](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L81) |
| <a id="modifiedattolerancems"></a> `modifiedAtToleranceMs?` | `number` | Tolerance in milliseconds applied to `modifiedAt` comparisons. Defaults to `1000`. | [src/sync/manifest.ts:83](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/sync/manifest.ts#L83) |
