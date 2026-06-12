[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferResumeMode

# Type Alias: TransferResumeMode

```ts
type TransferResumeMode = "auto" | "require" | "off";
```

Defined in: [src/transfers/createProviderTransferExecutor.ts:67](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/createProviderTransferExecutor.ts#L67)

Resume behavior for a transfer.

- `"auto"` (default) - resume when both endpoints are capable
  (`resumeDownload` on the source, `resumeUpload` on the destination) and a
  valid checkpoint exists; otherwise transfer from scratch.
- `"require"` - throw [UnsupportedFeatureError](../classes/UnsupportedFeatureError.md) when either endpoint
  cannot resume, instead of silently restarting.
- `"off"` - never consult or write checkpoints.
