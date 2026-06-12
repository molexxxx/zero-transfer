[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResumeMode

# Type Alias: TransferResumeMode

```ts
type TransferResumeMode = "auto" | "require" | "off";
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:67](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/transfers/createProviderTransferExecutor.ts#L67)

Resume behavior for a transfer.

- `"auto"` (default) - resume when both endpoints are capable
  (`resumeDownload` on the source, `resumeUpload` on the destination) and a
  valid checkpoint exists; otherwise transfer from scratch.
- `"require"` - throw [UnsupportedFeatureError](../classes/UnsupportedFeatureError.md) when either endpoint
  cannot resume, instead of silently restarting.
- `"off"` - never consult or write checkpoints.
