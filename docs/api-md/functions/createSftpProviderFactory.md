[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / createSftpProviderFactory

# Function: createSftpProviderFactory()

```ts
function createSftpProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/classic/sftp/SftpProvider.ts:113](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/SftpProvider.ts#L113)

Creates an SFTP provider factory backed by the mature `ssh2` implementation.

## Parameters

| Parameter | Type                                                          | Description                                           |
| --------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `options` | [`SftpProviderOptions`](../interfaces/SftpProviderOptions.md) | Optional ssh2 host-key verifier and timeout defaults. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.
