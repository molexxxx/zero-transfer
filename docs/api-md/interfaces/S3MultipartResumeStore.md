[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / S3MultipartResumeStore

# Interface: S3MultipartResumeStore

Defined in: [src/providers/web/S3Provider.ts:153](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/web/S3Provider.ts#L153)

Persistence contract for resuming partial multipart uploads across
processes or retries. Implementations may be synchronous or asynchronous;
`clear` is invoked once the multipart upload completes successfully (or is
explicitly aborted).

## Methods

### clear()

```ts
clear(key): void | Promise<void>;
```

Defined in: [src/providers/web/S3Provider.ts:158](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/web/S3Provider.ts#L158)

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

Defined in: [src/providers/web/S3Provider.ts:154](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/web/S3Provider.ts#L154)

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

Defined in: [src/providers/web/S3Provider.ts:157](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/providers/web/S3Provider.ts#L157)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | [`S3MultipartResumeKey`](S3MultipartResumeKey.md) |
| `checkpoint` | [`S3MultipartCheckpoint`](S3MultipartCheckpoint.md) |

#### Returns

`void` \| `Promise`\<`void`\>
