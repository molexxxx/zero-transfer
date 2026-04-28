[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createS3ProviderFactory

# Function: createS3ProviderFactory()

```ts
function createS3ProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/web/S3Provider.ts:149](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/web/S3Provider.ts#L149)

Creates an S3-compatible provider factory.

Credentials must be supplied via the connection profile: `username` is the
access key id and `password` is the secret access key. `profile.host` may
be set to the bucket name (taking precedence over `options.bucket`).

## Parameters

| Parameter | Type                                                      |
| --------- | --------------------------------------------------------- |
| `options` | [`S3ProviderOptions`](../interfaces/S3ProviderOptions.md) |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)
