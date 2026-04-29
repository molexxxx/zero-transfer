# @zero-transfer/core

> Provider-neutral contracts, transfer engine, queue, profiles, and errors.

## Install

```bash
npm install @zero-transfer/core
```

## Overview

The provider-neutral foundation: `TransferClient`, `createTransferClient`, the provider registry, capability sets, transfer engine, queue, planning primitives, profile resolution, secret redaction, structured logging, and typed errors. Every other scoped package builds on this surface.

## Usage

```ts
import { createLocalProviderFactory } from "@zero-transfer/core";
```

## Public surface

This package publishes a narrowed surface of **92** exports. These symbols are also available from [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:

| Symbol                                                                                                                                                         | Kind         | Notes              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------ |
| [`TransferClient`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/TransferClient.md)                                                | Class        | See API reference. |
| [`TransferClientOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferClientOptions.md)                               | Interface    | See API reference. |
| [`createTransferClient`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createTransferClient.md)                                  | Function     | See API reference. |
| [`ProviderRegistry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/ProviderRegistry.md)                                            | Class        | See API reference. |
| [`TransferSession`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferSession.md)                                           | Interface    | See API reference. |
| [`TransferProvider`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferProvider.md)                                         | Interface    | See API reference. |
| `ProviderCapabilities`                                                                                                                                         | _unresolved_ | —                  |
| [`ProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ProviderFactory.md)                                           | Interface    | See API reference. |
| [`ProviderTransferOperations`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ProviderTransferOperations.md)                     | Interface    | See API reference. |
| [`RemoteFileSystem`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteFileSystem.md)                                         | Interface    | See API reference. |
| [`CapabilitySet`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/CapabilitySet.md)                                               | Interface    | See API reference. |
| [`AuthenticationCapability`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/AuthenticationCapability.md)                       | Type         | See API reference. |
| [`ChecksumCapability`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/ChecksumCapability.md)                                   | Type         | See API reference. |
| [`MetadataCapability`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/MetadataCapability.md)                                   | Type         | See API reference. |
| [`BuiltInProviderId`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/BuiltInProviderId.md)                                     | Type         | See API reference. |
| [`ProviderId`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/ProviderId.md)                                                   | Type         | See API reference. |
| [`ProviderSelection`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ProviderSelection.md)                                       | Interface    | See API reference. |
| [`TransferEngine`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/TransferEngine.md)                                                | Class        | See API reference. |
| [`TransferQueue`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/TransferQueue.md)                                                  | Class        | See API reference. |
| [`TransferJob`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferJob.md)                                                   | Interface    | See API reference. |
| [`TransferPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferPlan.md)                                                 | Interface    | See API reference. |
| [`TransferReceipt`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferReceipt.md)                                           | Interface    | See API reference. |
| [`TransferEndpoint`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferEndpoint.md)                                         | Interface    | See API reference. |
| [`TransferOperation`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/TransferOperation.md)                                     | Type         | See API reference. |
| [`TransferAttempt`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferAttempt.md)                                           | Interface    | See API reference. |
| [`TransferRetryPolicy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferRetryPolicy.md)                                   | Interface    | See API reference. |
| [`TransferTimeoutPolicy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferTimeoutPolicy.md)                               | Interface    | See API reference. |
| [`TransferBandwidthLimit`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferBandwidthLimit.md)                             | Interface    | See API reference. |
| [`TransferVerificationResult`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/TransferVerificationResult.md)                     | Interface    | See API reference. |
| [`ProviderTransferSessionResolver`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/ProviderTransferSessionResolver.md)         | Type         | See API reference. |
| [`ProviderTransferSessionResolverInput`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ProviderTransferSessionResolverInput.md) | Interface    | See API reference. |
| [`createBandwidthThrottle`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createBandwidthThrottle.md)                            | Function     | See API reference. |
| [`createProviderTransferExecutor`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createProviderTransferExecutor.md)              | Function     | See API reference. |
| [`createTransferJobsFromPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createTransferJobsFromPlan.md)                      | Function     | See API reference. |
| [`createTransferPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createTransferPlan.md)                                      | Function     | See API reference. |
| [`summarizeTransferPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/summarizeTransferPlan.md)                                | Function     | See API reference. |
| [`throttleByteIterable`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/throttleByteIterable.md)                                  | Function     | See API reference. |
| [`copyBetween`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/copyBetween.md)                                                    | Function     | See API reference. |
| [`uploadFile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/uploadFile.md)                                                      | Function     | See API reference. |
| [`downloadFile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/downloadFile.md)                                                  | Function     | See API reference. |
| [`CopyBetweenOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/CopyBetweenOptions.md)                                     | Interface    | See API reference. |
| [`UploadFileOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/UploadFileOptions.md)                                       | Interface    | See API reference. |
| [`DownloadFileOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/DownloadFileOptions.md)                                   | Interface    | See API reference. |
| [`FriendlyTransferOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/FriendlyTransferOptions.md)                         | Type         | See API reference. |
| [`RemoteFileEndpoint`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteFileEndpoint.md)                                     | Interface    | See API reference. |
| [`runConnectionDiagnostics`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/runConnectionDiagnostics.md)                          | Function     | See API reference. |
| [`summarizeClientDiagnostics`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/summarizeClientDiagnostics.md)                      | Function     | See API reference. |
| [`ClientDiagnostics`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ClientDiagnostics.md)                                       | Interface    | See API reference. |
| [`ConnectionDiagnosticsResult`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ConnectionDiagnosticsResult.md)                   | Interface    | See API reference. |
| [`ConnectionDiagnosticTimings`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ConnectionDiagnosticTimings.md)                   | Interface    | See API reference. |
| [`RunConnectionDiagnosticsOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RunConnectionDiagnosticsOptions.md)           | Interface    | See API reference. |
| [`createLocalProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createLocalProviderFactory.md)                      | Function     | See API reference. |
| [`LocalProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/LocalProviderOptions.md)                                 | Interface    | See API reference. |
| [`createMemoryProviderFactory`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createMemoryProviderFactory.md)                    | Function     | See API reference. |
| [`MemoryProviderOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MemoryProviderOptions.md)                               | Interface    | See API reference. |
| [`MemoryProviderEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MemoryProviderEntry.md)                                   | Interface    | See API reference. |
| [`createSyncPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createSyncPlan.md)                                              | Function     | See API reference. |
| [`CreateSyncPlanOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/CreateSyncPlanOptions.md)                               | Interface    | See API reference. |
| [`diffRemoteTrees`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/diffRemoteTrees.md)                                            | Function     | See API reference. |
| [`DiffRemoteTreesOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/DiffRemoteTreesOptions.md)                             | Interface    | See API reference. |
| [`RemoteTreeDiff`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteTreeDiff.md)                                             | Interface    | See API reference. |
| [`RemoteTreeDiffEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteTreeDiffEntry.md)                                   | Interface    | See API reference. |
| [`RemoteTreeDiffSummary`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteTreeDiffSummary.md)                               | Interface    | See API reference. |
| [`createAtomicDeployPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createAtomicDeployPlan.md)                              | Function     | See API reference. |
| [`AtomicDeployPlan`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/AtomicDeployPlan.md)                                         | Interface    | See API reference. |
| [`AtomicDeployActivateStep`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/AtomicDeployActivateStep.md)                         | Interface    | See API reference. |
| [`AtomicDeployActivateOperation`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/AtomicDeployActivateOperation.md)             | Type         | See API reference. |
| [`AtomicDeployPruneStep`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/AtomicDeployPruneStep.md)                               | Interface    | See API reference. |
| [`AtomicDeployStrategy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/AtomicDeployStrategy.md)                               | Type         | See API reference. |
| [`CreateAtomicDeployPlanOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/CreateAtomicDeployPlanOptions.md)               | Interface    | See API reference. |
| [`walkRemoteTree`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/walkRemoteTree.md)                                              | Function     | See API reference. |
| [`WalkRemoteTreeOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/WalkRemoteTreeOptions.md)                               | Interface    | See API reference. |
| [`createRemoteBrowser`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createRemoteBrowser.md)                                    | Function     | See API reference. |
| [`RemoteBrowser`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteBrowser.md)                                               | Interface    | See API reference. |
| [`RemoteBrowserSnapshot`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteBrowserSnapshot.md)                               | Interface    | See API reference. |
| [`ConnectionProfile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ConnectionProfile.md)                                       | Interface    | See API reference. |
| [`RemoteEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/RemoteEntry.md)                                                   | Interface    | See API reference. |
| [`RemoteEntryType`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/RemoteEntryType.md)                                         | Type         | See API reference. |
| [`RemoteProtocol`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/RemoteProtocol.md)                                           | Type         | See API reference. |
| [`ListOptions`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ListOptions.md)                                                   | Interface    | See API reference. |
| [`validateConnectionProfile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/validateConnectionProfile.md)                        | Function     | See API reference. |
| [`resolveConnectionProfileSecrets`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/resolveConnectionProfileSecrets.md)            | Function     | See API reference. |
| [`redactConnectionProfile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/redactConnectionProfile.md)                            | Function     | See API reference. |
| [`redactSecretSource`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/redactSecretSource.md)                                      | Function     | See API reference. |
| [`resolveSecret`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/resolveSecret.md)                                                | Function     | See API reference. |
| [`createOAuthTokenSecretSource`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createOAuthTokenSecretSource.md)                  | Function     | See API reference. |
| [`ResolvedConnectionProfile`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ResolvedConnectionProfile.md)                       | Interface    | See API reference. |
| [`SecretSource`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/type-aliases/SecretSource.md)                                               | Type         | See API reference. |
| [`ZeroTransferError`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/ZeroTransferError.md)                                          | Class        | See API reference. |
| [`ZeroTransferLogger`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/ZeroTransferLogger.md)                                     | Interface    | See API reference. |
| [`noopLogger`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/variables/noopLogger.md)                                                      | Variable     | See API reference. |
| [`emitLog`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/emitLog.md)                                                            | Function     | See API reference. |

## Examples

| Example                                                                                                                    | What it shows                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`examples/local-copy-file.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/local-copy-file.ts)         | Local-to-local file copy example.                                |
| [`examples/ftp-basic.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/ftp-basic.ts)                     | Basic FTP upload + download example.                             |
| [`examples/transfer-queue.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/transfer-queue.ts)           | Transfer queue with concurrency, progress, and per-job receipts. |
| [`examples/dry-run-sync.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/dry-run-sync.ts)               | Dry-run sync planner.                                            |
| [`examples/diagnose-connection.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/diagnose-connection.ts) | Diagnose a connection without exposing secrets.                  |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/core.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
