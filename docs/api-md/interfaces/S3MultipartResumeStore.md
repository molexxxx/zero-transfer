[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartResumeStore

# Interface: S3MultipartResumeStore

Defined in: [src/providers/web/S3Provider.ts:129](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L129)

Persistence contract for resuming partial multipart uploads across
processes or retries. Implementations may be synchronous or asynchronous;
`clear` is invoked once the multipart upload completes successfully (or is
explicitly aborted).

## Methods

### clear()

```ts
clear(key): void | Promise<void>;
```

Defined in: [src/providers/web/S3Provider.ts:134](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L134)

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

Defined in: [src/providers/web/S3Provider.ts:130](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L130)

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

Defined in: [src/providers/web/S3Provider.ts:133](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/web/S3Provider.ts#L133)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |
| `checkpoint` | [`S3MultipartCheckpoint`](S3MultipartCheckpoint.md) |

#### Returns

`void` \| `Promise`\<`void`\>
