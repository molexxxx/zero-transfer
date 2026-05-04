[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartResumeStore

# Interface: S3MultipartResumeStore

Defined in: [src/providers/web/S3Provider.ts:113](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/S3Provider.ts#L113)

Persistence contract for resuming partial multipart uploads across
processes or retries. Implementations may be synchronous or asynchronous;
`clear` is invoked once the multipart upload completes successfully (or is
explicitly aborted).

## Methods

### clear()

```ts
clear(key): void | Promise<void>;
```

Defined in: [src/providers/web/S3Provider.ts:118](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/S3Provider.ts#L118)

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

Defined in: [src/providers/web/S3Provider.ts:114](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/S3Provider.ts#L114)

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

Defined in: [src/providers/web/S3Provider.ts:117](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/web/S3Provider.ts#L117)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |
| `checkpoint` | [`S3MultipartCheckpoint`](S3MultipartCheckpoint.md) |

#### Returns

`void` \| `Promise`\<`void`\>
