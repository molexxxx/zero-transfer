[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / CapabilitySet

# Interface: CapabilitySet

Defined in: [src/core/CapabilitySet.ts:46](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L46)

Capability snapshot advertised by a provider factory and active session.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="atomicrename"></a> `atomicRename` | `boolean` | Whether rename operations are atomic within the provider. | [src/core/CapabilitySet.ts:70](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L70) |
| <a id="authentication"></a> `authentication` | [`AuthenticationCapability`](../type-aliases/AuthenticationCapability.md)[] | Authentication mechanisms accepted by the provider. | [src/core/CapabilitySet.ts:50](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L50) |
| <a id="checksum"></a> `checksum` | [`ChecksumCapability`](../type-aliases/ChecksumCapability.md)[] | Checksum or provider hash mechanisms available for verification. | [src/core/CapabilitySet.ts:68](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L68) |
| <a id="chmod"></a> `chmod` | `boolean` | Whether chmod-style permission changes are supported. | [src/core/CapabilitySet.ts:72](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L72) |
| <a id="chown"></a> `chown` | `boolean` | Whether owner changes are supported. | [src/core/CapabilitySet.ts:74](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L74) |
| <a id="list"></a> `list` | `boolean` | Whether the provider can list child entries. | [src/core/CapabilitySet.ts:52](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L52) |
| <a id="maxconcurrency"></a> `maxConcurrency?` | `number` | Recommended maximum concurrent operations for this provider. | [src/core/CapabilitySet.ts:80](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L80) |
| <a id="metadata"></a> `metadata` | [`MetadataCapability`](../type-aliases/MetadataCapability.md)[] | Metadata fields the provider can preserve or report. | [src/core/CapabilitySet.ts:78](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L78) |
| <a id="notes"></a> `notes?` | `string`[] | Human-readable caveats for diagnostics or provider matrices. | [src/core/CapabilitySet.ts:82](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L82) |
| <a id="provider"></a> `provider` | [`ProviderId`](../type-aliases/ProviderId.md) | Provider this capability set describes. | [src/core/CapabilitySet.ts:48](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L48) |
| <a id="readstream"></a> `readStream` | `boolean` | Whether the provider can produce readable streams. | [src/core/CapabilitySet.ts:56](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L56) |
| <a id="resumedownload"></a> `resumeDownload` | `boolean` | Whether the provider can resume partial downloads. | [src/core/CapabilitySet.ts:64](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L64) |
| <a id="resumeupload"></a> `resumeUpload` | `boolean` | Whether the provider can resume partial uploads. | [src/core/CapabilitySet.ts:66](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L66) |
| <a id="serversidecopy"></a> `serverSideCopy` | `boolean` | Whether the provider can copy data without routing bytes through the client. | [src/core/CapabilitySet.ts:60](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L60) |
| <a id="serversidemove"></a> `serverSideMove` | `boolean` | Whether the provider can move data without routing bytes through the client. | [src/core/CapabilitySet.ts:62](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L62) |
| <a id="stat"></a> `stat` | `boolean` | Whether the provider can read metadata for a path. | [src/core/CapabilitySet.ts:54](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L54) |
| <a id="symlink"></a> `symlink` | `boolean` | Whether symbolic links are supported. | [src/core/CapabilitySet.ts:76](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L76) |
| <a id="writestream"></a> `writeStream` | `boolean` | Whether the provider can accept writable streams. | [src/core/CapabilitySet.ts:58](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/core/CapabilitySet.ts#L58) |
