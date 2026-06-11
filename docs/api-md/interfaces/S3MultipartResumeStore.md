[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartResumeStore

# Interface: S3MultipartResumeStore

Defined in: [src/providers/web/S3Provider.ts:135](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L135)

Persistence contract for resuming partial multipart uploads across
processes or retries. Implementations may be synchronous or asynchronous;
`clear` is invoked once the multipart upload completes successfully (or is
explicitly aborted).

## Methods

### clear()

```ts
clear(key): void | Promise<void>;
```

Defined in: [src/providers/web/S3Provider.ts:140](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L140)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |

#### Returns

`void` \| `Promise`\<`void`\>

***

### load()

```ts
load(key): 
  | S3MultipartCheckpoint
  | Promise<S3MultipartCheckpoint | undefined>
  | undefined;
```

Defined in: [src/providers/web/S3Provider.ts:136](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L136)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |

#### Returns

  \| [`S3MultipartCheckpoint`](S3MultipartCheckpoint.md)
  \| `Promise`\<[`S3MultipartCheckpoint`](S3MultipartCheckpoint.md) \| `undefined`\>
  \| `undefined`

***

### save()

```ts
save(key, checkpoint): void | Promise<void>;
```

Defined in: [src/providers/web/S3Provider.ts:139](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/providers/web/S3Provider.ts#L139)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |
| `checkpoint` | [`S3MultipartCheckpoint`](S3MultipartCheckpoint.md) |

#### Returns

`void` \| `Promise`\<`void`\>
