[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClientDefaults

# Interface: TransferClientDefaults

Defined in: [src/core/TransferClient.ts:60](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/core/TransferClient.ts#L60)

Client-level execution defaults applied when a call site does not supply
its own value.

Defaults are consumed by [runRoute](../functions/runRoute.md), the one-shot helpers
([uploadFile](../functions/uploadFile.md), [downloadFile](../functions/downloadFile.md), [copyBetween](../functions/copyBetween.md)),
[TransferQueue](../classes/TransferQueue.md) (via its `client` option), and scheduled routes fired
through [MftScheduler](../classes/MftScheduler.md). The [TransferEngine](../classes/TransferEngine.md) primitive stays
fully explicit: defaults never reach `engine.execute()` directly.

Per-call options always win over client defaults.

Additional default slots (`verify`, `compression`, `policy`) land here as
their features ship in later releases; the shape is additive.

## Example

```ts
import {
  createDefaultRetryPolicy,
  createFileSystemTransferCheckpointStore,
  createTransferClient,
} from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createSftpProviderFactory(), createS3ProviderFactory()],
  defaults: {
    retry: createDefaultRetryPolicy(),
    timeout: { stallTimeoutMs: 30_000 },
    resume: {
      store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
    },
  },
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="resume"></a> `resume?` | [`TransferResumeOptions`](TransferResumeOptions.md) | Default checkpoint/resume configuration for transfers executed through this client. | [src/core/TransferClient.ts:66](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/core/TransferClient.ts#L66) |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Default retry policy for transfers executed through this client. | [src/core/TransferClient.ts:62](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/core/TransferClient.ts#L62) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Default timeout policy for transfers executed through this client. | [src/core/TransferClient.ts:64](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/core/TransferClient.ts#L64) |
