[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartUploadPoolOptions

# Interface: MultipartUploadPoolOptions\<TResult\>

Defined in: [src/providers/web/multipartUploadPool.ts:139](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L139)

Options for [runMultipartUploadPool](../functions/runMultipartUploadPool.md).

## Type Parameters

| Type Parameter |
| ------ |
| `TResult` |

## Methods

### onCommitted()?

```ts
optional onCommitted(part, committedBytes): void | Promise<void>;
```

Defined in: [src/providers/web/multipartUploadPool.ts:162](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L162)

Observes the contiguous prefix of completed parts advancing. Called once
per part in strict part-number order; `committedBytes` is the byte end
of the contiguous prefix. Parts completed beyond a still-uploading gap
are *not* reported until the gap closes, so the value is monotonic and
safe to checkpoint. Awaited before further notifications fire.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `part` | [`MultipartUploadedPart`](MultipartUploadedPart.md)\<`TResult`\> |
| `committedBytes` | `number` |

#### Returns

`void` \| `Promise`\<`void`\>

***

### uploadPart()

```ts
uploadPart(part): Promise<TResult>;
```

Defined in: [src/providers/web/multipartUploadPool.ts:154](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L154)

Uploads one part and returns its provider token (ETag, block id, ...).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `part` | [`MultipartPart`](MultipartPart.md) |

#### Returns

`Promise`\<`TResult`\>

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="firstpartnumber"></a> `firstPartNumber?` | `number` | Part number of the first part the reader will produce (the reader's `startPartNumber`). Anchors contiguous-prefix commit tracking. Defaults to `1`. | [src/providers/web/multipartUploadPool.ts:152](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L152) |
| <a id="partconcurrency"></a> `partConcurrency` | `number` | Number of parts uploaded concurrently. `1` reproduces sequential behavior. Memory bound: `(partConcurrency + 1) x partSizeBytes`. | [src/providers/web/multipartUploadPool.ts:146](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L146) |
| <a id="reader"></a> `reader` | [`MultipartPartReader`](MultipartPartReader.md) | Sequential part source (see [createSequentialPartReader](../functions/createSequentialPartReader.md)). | [src/providers/web/multipartUploadPool.ts:141](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L141) |
| <a id="throwifaborted"></a> `throwIfAborted?` | () => `void` | Abort check invoked before each part upload. | [src/providers/web/multipartUploadPool.ts:164](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/web/multipartUploadPool.ts#L164) |
