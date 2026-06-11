[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferClientDefaults

# Interface: TransferClientDefaults

Defined in: [src/core/TransferClient.ts:52](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L52)

Client-level execution defaults applied when a call site does not supply
its own value.

Defaults are consumed by [runRoute](../functions/runRoute.md), the one-shot helpers
([uploadFile](../functions/uploadFile.md), [downloadFile](../functions/downloadFile.md), [copyBetween](../functions/copyBetween.md)),
[TransferQueue](../classes/TransferQueue.md) (via its `client` option), and scheduled routes fired
through [MftScheduler](../classes/MftScheduler.md). The [TransferEngine](../classes/TransferEngine.md) primitive stays
fully explicit: defaults never reach `engine.execute()` directly.

Per-call options always win over client defaults.

Additional default slots (`verify`, `resume`, `compression`, `policy`) land
here as their features ship in later releases; the shape is additive.

## Example

```ts
import { createDefaultRetryPolicy, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createSftpProviderFactory(), createS3ProviderFactory()],
  defaults: {
    retry: createDefaultRetryPolicy(),
    timeout: { stallTimeoutMs: 30_000 },
  },
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="retry"></a> `retry?` | [`TransferRetryPolicy`](TransferRetryPolicy.md) | Default retry policy for transfers executed through this client. | [src/core/TransferClient.ts:54](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L54) |
| <a id="timeout"></a> `timeout?` | [`TransferTimeoutPolicy`](TransferTimeoutPolicy.md) | Default timeout policy for transfers executed through this client. | [src/core/TransferClient.ts:56](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/core/TransferClient.ts#L56) |
