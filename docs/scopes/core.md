# Core — provider-neutral SDK

> Provider-neutral contracts, transfer engine, queue, profiles, and errors.

## Install

```bash
npm install @zero-transfer/core
```

## Overview

The provider-neutral foundation: `TransferClient`, `createTransferClient`, the provider registry, capability sets, transfer engine, queue, planning primitives, profile resolution, secret redaction, structured logging, and typed errors. Every other scoped package builds on this surface.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                                      | Kind         | Notes              |
| ------------------------------------------------------------------------------------------- | ------------ | ------------------ |
| [`TransferClient`](../api-md/classes/TransferClient.md)                                     | Class        | See API reference. |
| [`TransferClientOptions`](../api-md/interfaces/TransferClientOptions.md)                    | Interface    | See API reference. |
| [`createTransferClient`](../api-md/functions/createTransferClient.md)                       | Function     | See API reference. |
| [`ProviderRegistry`](../api-md/classes/ProviderRegistry.md)                                 | Class        | See API reference. |
| [`TransferSession`](../api-md/interfaces/TransferSession.md)                                | Interface    | See API reference. |
| [`TransferProvider`](../api-md/interfaces/TransferProvider.md)                              | Interface    | See API reference. |
| `ProviderCapabilities`                                                                      | _unresolved_ | —                  |
| [`ProviderFactory`](../api-md/interfaces/ProviderFactory.md)                                | Interface    | See API reference. |
| [`ProviderTransferOperations`](../api-md/interfaces/ProviderTransferOperations.md)          | Interface    | See API reference. |
| [`RemoteFileSystem`](../api-md/interfaces/RemoteFileSystem.md)                              | Interface    | See API reference. |
| [`CapabilitySet`](../api-md/interfaces/CapabilitySet.md)                                    | Interface    | See API reference. |
| [`AuthenticationCapability`](../api-md/type-aliases/AuthenticationCapability.md)            | Type         | See API reference. |
| [`ChecksumCapability`](../api-md/type-aliases/ChecksumCapability.md)                        | Type         | See API reference. |
| [`MetadataCapability`](../api-md/type-aliases/MetadataCapability.md)                        | Type         | See API reference. |
| [`BuiltInProviderId`](../api-md/type-aliases/BuiltInProviderId.md)                          | Type         | See API reference. |
| [`ProviderId`](../api-md/type-aliases/ProviderId.md)                                        | Type         | See API reference. |
| [`ProviderSelection`](../api-md/interfaces/ProviderSelection.md)                            | Interface    | See API reference. |
| [`TransferEngine`](../api-md/classes/TransferEngine.md)                                     | Class        | See API reference. |
| [`TransferQueue`](../api-md/classes/TransferQueue.md)                                       | Class        | See API reference. |
| [`TransferJob`](../api-md/interfaces/TransferJob.md)                                        | Interface    | See API reference. |
| [`TransferPlan`](../api-md/interfaces/TransferPlan.md)                                      | Interface    | See API reference. |
| [`TransferReceipt`](../api-md/interfaces/TransferReceipt.md)                                | Interface    | See API reference. |
| [`TransferEndpoint`](../api-md/interfaces/TransferEndpoint.md)                              | Interface    | See API reference. |
| [`TransferOperation`](../api-md/type-aliases/TransferOperation.md)                          | Type         | See API reference. |
| [`TransferAttempt`](../api-md/interfaces/TransferAttempt.md)                                | Interface    | See API reference. |
| [`TransferRetryPolicy`](../api-md/interfaces/TransferRetryPolicy.md)                        | Interface    | See API reference. |
| [`TransferTimeoutPolicy`](../api-md/interfaces/TransferTimeoutPolicy.md)                    | Interface    | See API reference. |
| [`TransferBandwidthLimit`](../api-md/interfaces/TransferBandwidthLimit.md)                  | Interface    | See API reference. |
| [`TransferVerificationResult`](../api-md/interfaces/TransferVerificationResult.md)          | Interface    | See API reference. |
| [`createBandwidthThrottle`](../api-md/functions/createBandwidthThrottle.md)                 | Function     | See API reference. |
| [`createProviderTransferExecutor`](../api-md/functions/createProviderTransferExecutor.md)   | Function     | See API reference. |
| [`createTransferJobsFromPlan`](../api-md/functions/createTransferJobsFromPlan.md)           | Function     | See API reference. |
| [`createTransferPlan`](../api-md/functions/createTransferPlan.md)                           | Function     | See API reference. |
| [`summarizeTransferPlan`](../api-md/functions/summarizeTransferPlan.md)                     | Function     | See API reference. |
| [`throttleByteIterable`](../api-md/functions/throttleByteIterable.md)                       | Function     | See API reference. |
| [`validateConnectionProfile`](../api-md/functions/validateConnectionProfile.md)             | Function     | See API reference. |
| [`resolveConnectionProfileSecrets`](../api-md/functions/resolveConnectionProfileSecrets.md) | Function     | See API reference. |
| [`redactConnectionProfile`](../api-md/functions/redactConnectionProfile.md)                 | Function     | See API reference. |
| [`redactSecretSource`](../api-md/functions/redactSecretSource.md)                           | Function     | See API reference. |
| [`resolveSecret`](../api-md/functions/resolveSecret.md)                                     | Function     | See API reference. |
| [`createOAuthTokenSecretSource`](../api-md/functions/createOAuthTokenSecretSource.md)       | Function     | See API reference. |
| [`ZeroTransferError`](../api-md/classes/ZeroTransferError.md)                               | Class        | See API reference. |
| [`ZeroTransferLogger`](../api-md/interfaces/ZeroTransferLogger.md)                          | Interface    | See API reference. |
| [`noopLogger`](../api-md/variables/noopLogger.md)                                           | Variable     | See API reference. |
| [`emitLog`](../api-md/functions/emitLog.md)                                                 | Function     | See API reference. |

## Examples

| Example                                                                    | What it shows                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`examples/transfer-queue.ts`](../../examples/transfer-queue.ts)           | Transfer queue with concurrency, progress, and per-job receipts. |
| [`examples/dry-run-sync.ts`](../../examples/dry-run-sync.ts)               | Dry-run sync planner.                                            |
| [`examples/diagnose-connection.ts`](../../examples/diagnose-connection.ts) | Diagnose a connection without exposing secrets.                  |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/core`](../../packages/core)
