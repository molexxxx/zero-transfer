[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MultipartPartReader

# Interface: MultipartPartReader

Defined in: src/providers/web/multipartUploadPool.ts:37

Sequential part source shared by upload workers.

## Methods

### next()

```ts
next(): Promise<MultipartPart | undefined>;
```

Defined in: src/providers/web/multipartUploadPool.ts:42

Cuts and returns the next part, or `undefined` when the source is
exhausted. Concurrent calls are serialized internally.

#### Returns

`Promise`\<[`MultipartPart`](MultipartPart.md) \| `undefined`\>
