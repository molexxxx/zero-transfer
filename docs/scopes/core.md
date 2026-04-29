# Core — provider-neutral SDK

> Provider-neutral contracts, transfer engine, queue, profiles, and errors.

## Install

```bash
npm install @zero-transfer/core
```

## Overview

The provider-neutral foundation: `TransferClient`, `createTransferClient`, the provider registry, capability sets, transfer engine, queue, planning primitives, profile resolution, secret redaction, structured logging, and typed errors. Every other scoped package builds on this surface.

## Public surface

This is the actual surface published by [`@zero-transfer/core`](https://www.npmjs.com/package/@zero-transfer/core). These symbols are also available from [`@zero-transfer/sdk`](../api-md/README.md); the links below point to the full API reference:

| Symbol | Kind | Notes |
| --- | --- | --- |
| [`TransferClient`](../api-md/classes/TransferClient.md) | Class | See API reference. |
| [`TransferClientOptions`](../api-md/interfaces/TransferClientOptions.md) | Interface | See API reference. |
| [`createTransferClient`](../api-md/functions/createTransferClient.md) | Function | See API reference. |
| [`ProviderRegistry`](../api-md/classes/ProviderRegistry.md) | Class | See API reference. |
| [`TransferSession`](../api-md/interfaces/TransferSession.md) | Interface | See API reference. |
| [`TransferProvider`](../api-md/interfaces/TransferProvider.md) | Interface | See API reference. |
| `ProviderCapabilities` | _unresolved_ | — |
| [`ProviderFactory`](../api-md/interfaces/ProviderFactory.md) | Interface | See API reference. |
| [`ProviderTransferOperations`](../api-md/interfaces/ProviderTransferOperations.md) | Interface | See API reference. |
| [`RemoteFileSystem`](../api-md/interfaces/RemoteFileSystem.md) | Interface | See API reference. |
| [`CapabilitySet`](../api-md/interfaces/CapabilitySet.md) | Interface | See API reference. |
| [`AuthenticationCapability`](../api-md/type-aliases/AuthenticationCapability.md) | Type | See API reference. |
| [`ChecksumCapability`](../api-md/type-aliases/ChecksumCapability.md) | Type | See API reference. |
| [`MetadataCapability`](../api-md/type-aliases/MetadataCapability.md) | Type | See API reference. |
| [`BuiltInProviderId`](../api-md/type-aliases/BuiltInProviderId.md) | Type | See API reference. |
| [`ProviderId`](../api-md/type-aliases/ProviderId.md) | Type | See API reference. |
| [`ProviderSelection`](../api-md/interfaces/ProviderSelection.md) | Interface | See API reference. |
| [`TransferEngine`](../api-md/classes/TransferEngine.md) | Class | See API reference. |
| [`TransferQueue`](../api-md/classes/TransferQueue.md) | Class | See API reference. |
| [`TransferJob`](../api-md/interfaces/TransferJob.md) | Interface | See API reference. |
| [`TransferPlan`](../api-md/interfaces/TransferPlan.md) | Interface | See API reference. |
| [`TransferReceipt`](../api-md/interfaces/TransferReceipt.md) | Interface | See API reference. |
| [`TransferEndpoint`](../api-md/interfaces/TransferEndpoint.md) | Interface | See API reference. |
| [`TransferOperation`](../api-md/type-aliases/TransferOperation.md) | Type | See API reference. |
| [`TransferAttempt`](../api-md/interfaces/TransferAttempt.md) | Interface | See API reference. |
| [`TransferRetryPolicy`](../api-md/interfaces/TransferRetryPolicy.md) | Interface | See API reference. |
| [`TransferTimeoutPolicy`](../api-md/interfaces/TransferTimeoutPolicy.md) | Interface | See API reference. |
| [`TransferBandwidthLimit`](../api-md/interfaces/TransferBandwidthLimit.md) | Interface | See API reference. |
| [`TransferVerificationResult`](../api-md/interfaces/TransferVerificationResult.md) | Interface | See API reference. |
| [`ProviderTransferSessionResolver`](../api-md/type-aliases/ProviderTransferSessionResolver.md) | Type | See API reference. |
| [`ProviderTransferSessionResolverInput`](../api-md/interfaces/ProviderTransferSessionResolverInput.md) | Interface | See API reference. |
| [`createBandwidthThrottle`](../api-md/functions/createBandwidthThrottle.md) | Function | See API reference. |
| [`createProviderTransferExecutor`](../api-md/functions/createProviderTransferExecutor.md) | Function | See API reference. |
| [`createTransferJobsFromPlan`](../api-md/functions/createTransferJobsFromPlan.md) | Function | See API reference. |
| [`createTransferPlan`](../api-md/functions/createTransferPlan.md) | Function | See API reference. |
| [`summarizeTransferPlan`](../api-md/functions/summarizeTransferPlan.md) | Function | See API reference. |
| [`throttleByteIterable`](../api-md/functions/throttleByteIterable.md) | Function | See API reference. |
| [`copyBetween`](../api-md/functions/copyBetween.md) | Function | See API reference. |
| [`uploadFile`](../api-md/functions/uploadFile.md) | Function | See API reference. |
| [`downloadFile`](../api-md/functions/downloadFile.md) | Function | See API reference. |
| [`CopyBetweenOptions`](../api-md/interfaces/CopyBetweenOptions.md) | Interface | See API reference. |
| [`UploadFileOptions`](../api-md/interfaces/UploadFileOptions.md) | Interface | See API reference. |
| [`DownloadFileOptions`](../api-md/interfaces/DownloadFileOptions.md) | Interface | See API reference. |
| [`FriendlyTransferOptions`](../api-md/type-aliases/FriendlyTransferOptions.md) | Type | See API reference. |
| [`RemoteFileEndpoint`](../api-md/interfaces/RemoteFileEndpoint.md) | Interface | See API reference. |
| [`runConnectionDiagnostics`](../api-md/functions/runConnectionDiagnostics.md) | Function | See API reference. |
| [`summarizeClientDiagnostics`](../api-md/functions/summarizeClientDiagnostics.md) | Function | See API reference. |
| [`ClientDiagnostics`](../api-md/interfaces/ClientDiagnostics.md) | Interface | See API reference. |
| [`ConnectionDiagnosticsResult`](../api-md/interfaces/ConnectionDiagnosticsResult.md) | Interface | See API reference. |
| [`ConnectionDiagnosticTimings`](../api-md/interfaces/ConnectionDiagnosticTimings.md) | Interface | See API reference. |
| [`RunConnectionDiagnosticsOptions`](../api-md/interfaces/RunConnectionDiagnosticsOptions.md) | Interface | See API reference. |
| [`createLocalProviderFactory`](../api-md/functions/createLocalProviderFactory.md) | Function | See API reference. |
| [`LocalProviderOptions`](../api-md/interfaces/LocalProviderOptions.md) | Interface | See API reference. |
| [`createMemoryProviderFactory`](../api-md/functions/createMemoryProviderFactory.md) | Function | See API reference. |
| [`MemoryProviderOptions`](../api-md/interfaces/MemoryProviderOptions.md) | Interface | See API reference. |
| [`MemoryProviderEntry`](../api-md/interfaces/MemoryProviderEntry.md) | Interface | See API reference. |
| [`createSyncPlan`](../api-md/functions/createSyncPlan.md) | Function | See API reference. |
| [`CreateSyncPlanOptions`](../api-md/interfaces/CreateSyncPlanOptions.md) | Interface | See API reference. |
| [`diffRemoteTrees`](../api-md/functions/diffRemoteTrees.md) | Function | See API reference. |
| [`DiffRemoteTreesOptions`](../api-md/interfaces/DiffRemoteTreesOptions.md) | Interface | See API reference. |
| [`RemoteTreeDiff`](../api-md/interfaces/RemoteTreeDiff.md) | Interface | See API reference. |
| [`RemoteTreeDiffEntry`](../api-md/interfaces/RemoteTreeDiffEntry.md) | Interface | See API reference. |
| [`RemoteTreeDiffSummary`](../api-md/interfaces/RemoteTreeDiffSummary.md) | Interface | See API reference. |
| [`createAtomicDeployPlan`](../api-md/functions/createAtomicDeployPlan.md) | Function | See API reference. |
| [`AtomicDeployPlan`](../api-md/interfaces/AtomicDeployPlan.md) | Interface | See API reference. |
| [`AtomicDeployActivateStep`](../api-md/interfaces/AtomicDeployActivateStep.md) | Interface | See API reference. |
| [`AtomicDeployActivateOperation`](../api-md/type-aliases/AtomicDeployActivateOperation.md) | Type | See API reference. |
| [`AtomicDeployPruneStep`](../api-md/interfaces/AtomicDeployPruneStep.md) | Interface | See API reference. |
| [`AtomicDeployStrategy`](../api-md/type-aliases/AtomicDeployStrategy.md) | Type | See API reference. |
| [`CreateAtomicDeployPlanOptions`](../api-md/interfaces/CreateAtomicDeployPlanOptions.md) | Interface | See API reference. |
| [`walkRemoteTree`](../api-md/functions/walkRemoteTree.md) | Function | See API reference. |
| [`WalkRemoteTreeOptions`](../api-md/interfaces/WalkRemoteTreeOptions.md) | Interface | See API reference. |
| [`createRemoteBrowser`](../api-md/functions/createRemoteBrowser.md) | Function | See API reference. |
| [`RemoteBrowser`](../api-md/interfaces/RemoteBrowser.md) | Interface | See API reference. |
| [`RemoteBrowserSnapshot`](../api-md/interfaces/RemoteBrowserSnapshot.md) | Interface | See API reference. |
| [`ConnectionProfile`](../api-md/interfaces/ConnectionProfile.md) | Interface | See API reference. |
| [`RemoteEntry`](../api-md/interfaces/RemoteEntry.md) | Interface | See API reference. |
| [`RemoteEntryType`](../api-md/type-aliases/RemoteEntryType.md) | Type | See API reference. |
| [`RemoteProtocol`](../api-md/type-aliases/RemoteProtocol.md) | Type | See API reference. |
| [`ListOptions`](../api-md/interfaces/ListOptions.md) | Interface | See API reference. |
| [`validateConnectionProfile`](../api-md/functions/validateConnectionProfile.md) | Function | See API reference. |
| [`resolveConnectionProfileSecrets`](../api-md/functions/resolveConnectionProfileSecrets.md) | Function | See API reference. |
| [`redactConnectionProfile`](../api-md/functions/redactConnectionProfile.md) | Function | See API reference. |
| [`redactSecretSource`](../api-md/functions/redactSecretSource.md) | Function | See API reference. |
| [`resolveSecret`](../api-md/functions/resolveSecret.md) | Function | See API reference. |
| [`createOAuthTokenSecretSource`](../api-md/functions/createOAuthTokenSecretSource.md) | Function | See API reference. |
| [`ResolvedConnectionProfile`](../api-md/interfaces/ResolvedConnectionProfile.md) | Interface | See API reference. |
| [`SecretSource`](../api-md/type-aliases/SecretSource.md) | Type | See API reference. |
| [`ZeroTransferError`](../api-md/classes/ZeroTransferError.md) | Class | See API reference. |
| [`ZeroTransferLogger`](../api-md/interfaces/ZeroTransferLogger.md) | Interface | See API reference. |
| [`noopLogger`](../api-md/variables/noopLogger.md) | Variable | See API reference. |
| [`emitLog`](../api-md/functions/emitLog.md) | Function | See API reference. |

## Examples

| Example | What it shows |
| --- | --- |
| [`examples/local-copy-file.ts`](../../examples/local-copy-file.ts) | Local-to-local file copy example. |
| [`examples/ftp-basic.ts`](../../examples/ftp-basic.ts) | Basic FTP upload + download example. |
| [`examples/transfer-queue.ts`](../../examples/transfer-queue.ts) | Transfer queue with concurrency, progress, and per-job receipts. |
| [`examples/dry-run-sync.ts`](../../examples/dry-run-sync.ts) | Dry-run sync planner. |
| [`examples/diagnose-connection.ts`](../../examples/diagnose-connection.ts) | Diagnose a connection without exposing secrets. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/core`](../../packages/core)
