[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResumeOptions

# Interface: TransferResumeOptions

Defined in: [src/transfers/createProviderTransferExecutor.ts:89](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createProviderTransferExecutor.ts#L89)

Checkpoint/resume configuration consumed by
[createProviderTransferExecutor](../functions/createProviderTransferExecutor.md) (directly or through
[runRoute](../functions/runRoute.md) / client defaults).

## Example

```ts
import {
  createFileSystemTransferCheckpointStore,
  createProviderTransferExecutor,
} from "@zero-transfer/sdk";

const executor = createProviderTransferExecutor({
  resolveSession,
  resume: {
    store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
  },
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="mode"></a> `mode?` | [`TransferResumeMode`](../type-aliases/TransferResumeMode.md) | Resume behavior. Defaults to `"auto"`. | [src/transfers/createProviderTransferExecutor.ts:93](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createProviderTransferExecutor.ts#L93) |
| <a id="persistintervalbytes"></a> `persistIntervalBytes?` | `number` | Minimum bytes of new committed progress between byte-offset checkpoint persists. Defaults to 8 MiB. Part-aware providers persist per committed part instead and ignore this value. | [src/transfers/createProviderTransferExecutor.ts:99](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createProviderTransferExecutor.ts#L99) |
| <a id="scope"></a> `scope?` | `string` | Optional namespace mixed into checkpoint keys. Checkpoints are keyed by source+destination provider/path; set a scope (for example the host or profile id) when identical provider/path pairs can refer to different servers. | [src/transfers/createProviderTransferExecutor.ts:106](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createProviderTransferExecutor.ts#L106) |
| <a id="store"></a> `store` | [`TransferCheckpointStore`](TransferCheckpointStore.md) | Checkpoint persistence backend. | [src/transfers/createProviderTransferExecutor.ts:91](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/transfers/createProviderTransferExecutor.ts#L91) |
