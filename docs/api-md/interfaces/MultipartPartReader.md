[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartPartReader

# Interface: MultipartPartReader

Defined in: [src/providers/web/multipartUploadPool.ts:37](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L37)

Sequential part source shared by upload workers.

## Methods

### next()

```ts
next(): Promise<MultipartPart | undefined>;
```

Defined in: [src/providers/web/multipartUploadPool.ts:42](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/providers/web/multipartUploadPool.ts#L42)

Cuts and returns the next part, or `undefined` when the source is
exhausted. Concurrent calls are serialized internally.

#### Returns

`Promise`\<[`MultipartPart`](MultipartPart.md) \| `undefined`\>
