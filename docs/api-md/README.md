**ZeroTransfer SDK v0.4.4**

***

# ZeroTransfer SDK v0.4.4

ZeroTransfer public API surface.

This barrel exports the alpha foundation: the transfer facade, shared public
types, typed errors, parser utilities, logging helpers, transfer helpers, and
path safety utilities used by future protocol adapters.

## Functions

| Function | Description |
| ------ | ------ |
| [assertSafeFtpArgument](functions/assertSafeFtpArgument.md) | Validates that an FTP command argument cannot inject additional command lines. |
| [basenameRemotePath](functions/basenameRemotePath.md) | Extracts the final name segment from a normalized remote path. |
| [buildPublickeyCredential](functions/buildPublickeyCredential.md) | - |
| [buildRemoteBreadcrumbs](functions/buildRemoteBreadcrumbs.md) | Builds breadcrumbs from `/` down to the supplied path. |
| [compareRemoteManifests](functions/compareRemoteManifests.md) | Compares two manifests and produces an entry-level diff. |
| [composeAuditLogs](functions/composeAuditLogs.md) | Combines multiple audit logs into a single fan-out log. |
| [copyBetween](functions/copyBetween.md) | Copies a file between two remote endpoints in a single call. |
| [createApprovalGate](functions/createApprovalGate.md) | Wraps a route runner with an approval gate. |
| [createAtomicDeployPlan](functions/createAtomicDeployPlan.md) | Builds an [AtomicDeployPlan](interfaces/AtomicDeployPlan.md) that stages a release, swaps it live, and prunes old releases. |
| [createAzureBlobProviderFactory](functions/createAzureBlobProviderFactory.md) | Creates an Azure Blob Storage provider factory. |
| [createBandwidthThrottle](functions/createBandwidthThrottle.md) | Creates a token-bucket throttle that paces an asynchronous data pipeline to a sustained [TransferBandwidthLimit](interfaces/TransferBandwidthLimit.md). |
| [createDropboxProviderFactory](functions/createDropboxProviderFactory.md) | Creates a Dropbox provider factory. |
| [createFileSystemS3MultipartResumeStore](functions/createFileSystemS3MultipartResumeStore.md) | File-system backed [S3MultipartResumeStore](interfaces/S3MultipartResumeStore.md) that survives process restarts. Each in-flight multipart upload is checkpointed to a single JSON file in `options.directory` after every part. On retry the upload reuses the stored `uploadId` and skips parts that S3 has already accepted. |
| [createFtpProviderFactory](functions/createFtpProviderFactory.md) | Creates a provider factory for classic FTP connections. |
| [createFtpsProviderFactory](functions/createFtpsProviderFactory.md) | Creates a provider factory for explicit or implicit FTPS connections. |
| [createGcsProviderFactory](functions/createGcsProviderFactory.md) | Creates a Google Cloud Storage provider factory. |
| [createGoogleDriveProviderFactory](functions/createGoogleDriveProviderFactory.md) | Creates a Google Drive provider factory. |
| [createHttpProviderFactory](functions/createHttpProviderFactory.md) | Creates a provider factory backed by HTTP(S) GET/HEAD. |
| [createInboxRoute](functions/createInboxRoute.md) | Creates a route that pulls files out of an inbox into a destination directory. |
| [createJsonlAuditLog](functions/createJsonlAuditLog.md) | Creates an audit log that streams records as newline-delimited JSON. |
| [createLocalProviderFactory](functions/createLocalProviderFactory.md) | Creates a provider factory backed by the local filesystem. |
| [createMemoryProviderFactory](functions/createMemoryProviderFactory.md) | Creates a provider factory backed by deterministic in-memory fixture entries. |
| [createMemoryS3MultipartResumeStore](functions/createMemoryS3MultipartResumeStore.md) | Creates an in-memory [S3MultipartResumeStore](interfaces/S3MultipartResumeStore.md). |
| [createOAuthTokenSecretSource](functions/createOAuthTokenSecretSource.md) | Builds a [SecretProvider](type-aliases/SecretProvider.md) that exchanges a refresh callback for cached, auto-renewing access tokens. |
| [createOneDriveProviderFactory](functions/createOneDriveProviderFactory.md) | Creates a OneDrive/SharePoint provider factory backed by Microsoft Graph. |
| [createOutboxRoute](functions/createOutboxRoute.md) | Creates a route that drops files from a source endpoint into an outbox directory. |
| [createPooledTransferClient](functions/createPooledTransferClient.md) | Wraps a [TransferClient](classes/TransferClient.md) with connection pooling. |
| [createProgressEvent](functions/createProgressEvent.md) | Creates a progress event with elapsed time, rate, and optional percentage. |
| [createProviderTransferExecutor](functions/createProviderTransferExecutor.md) | Creates a [TransferExecutor](type-aliases/TransferExecutor.md) that reads from a source provider and writes to a destination provider. |
| [createRemoteBrowser](functions/createRemoteBrowser.md) | Creates a stateful directory browser around a remote file system. |
| [createRemoteManifest](functions/createRemoteManifest.md) | Walks a remote subtree and produces a serializable manifest snapshot. |
| [createS3ProviderFactory](functions/createS3ProviderFactory.md) | Creates an S3-compatible provider factory. |
| [createSftpProviderFactory](functions/createSftpProviderFactory.md) | Creates a [ProviderFactory](interfaces/ProviderFactory.md) backed by the native SSH/SFTP protocol stack - no `ssh2` dependency required. |
| [createSyncPlan](functions/createSyncPlan.md) | Builds a [TransferPlan](interfaces/TransferPlan.md) that reconciles two remote subtrees. |
| [createTransferClient](functions/createTransferClient.md) | Creates a provider-neutral transfer client. |
| [createTransferJobsFromPlan](functions/createTransferJobsFromPlan.md) | Converts executable plan steps into transfer jobs while preserving order. |
| [createTransferPlan](functions/createTransferPlan.md) | Creates a transfer plan from dry-run planning input. |
| [createTransferResult](functions/createTransferResult.md) | Creates a final transfer result with duration and average throughput. |
| [createWebDavProviderFactory](functions/createWebDavProviderFactory.md) | Creates a WebDAV provider factory. |
| [createWebhookAuditLog](functions/createWebhookAuditLog.md) | Wraps a webhook target as an [MftAuditLog](interfaces/MftAuditLog.md). |
| [diffRemoteTrees](functions/diffRemoteTrees.md) | Compares two remote subtrees and produces an entry-level diff. |
| [dispatchWebhook](functions/dispatchWebhook.md) | Dispatches a single webhook payload with bounded retries. |
| [downloadFile](functions/downloadFile.md) | Downloads a single remote file to a local path. |
| [emitLog](functions/emitLog.md) | Emits a structured log record if the logger implements the requested level. |
| [errorFromFtpReply](functions/errorFromFtpReply.md) | Maps an FTP reply into the closest typed ZeroTransfer error. |
| [evaluateRetention](functions/evaluateRetention.md) | Splits a listing into retained and evictable entries according to a policy. |
| [filterRemoteEntries](functions/filterRemoteEntries.md) | Filters entries using the optional predicate plus an optional hidden-file rule. |
| [formatCapabilityMatrixMarkdown](functions/formatCapabilityMatrixMarkdown.md) | Renders the matrix returned by [getBuiltinCapabilityMatrix](functions/getBuiltinCapabilityMatrix.md) as a GitHub-flavored Markdown table covering the most commonly-compared capability flags. |
| [freezeReceipt](functions/freezeReceipt.md) | Returns a deeply frozen copy of a transfer receipt. |
| [getBuiltinCapabilityMatrix](functions/getBuiltinCapabilityMatrix.md) | Returns the capability matrix for every shipped provider factory. |
| [importFileZillaSites](functions/importFileZillaSites.md) | Parses FileZilla `sitemanager.xml` text and returns generated profiles. |
| [importOpenSshConfig](functions/importOpenSshConfig.md) | Builds a [ConnectionProfile](interfaces/ConnectionProfile.md) for the given SSH alias from `ssh_config` text or pre-parsed entries. |
| [importWinScpSessions](functions/importWinScpSessions.md) | Parses WinSCP `WinSCP.ini` text and returns generated profiles. |
| [inboxFailedPath](functions/inboxFailedPath.md) | Computes the absolute path used to quarantine failed files. |
| [inboxProcessedPath](functions/inboxProcessedPath.md) | Computes the absolute path used to archive successfully processed files. |
| [isClassicProviderId](functions/isClassicProviderId.md) | Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family. |
| [isMainModule](functions/isMainModule.md) | Returns `true` when the file containing `import.meta.url` is the entry point of the current Node.js process. Returns `false` outside Node. |
| [isSensitiveKey](functions/isSensitiveKey.md) | Checks whether an object key is likely to contain sensitive data. |
| [joinRemotePath](functions/joinRemotePath.md) | Joins remote path segments and normalizes the result. |
| [matchKnownHosts](functions/matchKnownHosts.md) | Filters parsed entries down to those that match the given host/port. Negations are honored. |
| [matchKnownHostsEntry](functions/matchKnownHostsEntry.md) | Returns true when the given host (and optional port) matches the entry's host patterns. Hashed entries use HMAC-SHA1 verification per OpenSSH semantics. |
| [negotiateSshAlgorithms](functions/negotiateSshAlgorithms.md) | Intersects client and server algorithm lists using SSH's client-priority selection model. |
| [nextCronFireAt](functions/nextCronFireAt.md) | Computes the next time at which a cron expression fires strictly after `from`. |
| [nextScheduleFireAt](functions/nextScheduleFireAt.md) | Computes the next fire time for a schedule strictly after `from`. |
| [normalizeRemotePath](functions/normalizeRemotePath.md) | Normalizes a remote path using POSIX-style separators without escaping absolute roots. |
| [parentRemotePath](functions/parentRemotePath.md) | Returns the parent directory of a remote path, or `"/"` for root inputs. |
| [parseCronExpression](functions/parseCronExpression.md) | Parses a 5-field cron expression. |
| [parseFtpFeatures](functions/parseFtpFeatures.md) | Parses FTP FEAT output into a normalized feature set. |
| [parseFtpResponseLines](functions/parseFtpResponseLines.md) | Parses an exact set of response lines into one complete FTP response. |
| [parseKnownHosts](functions/parseKnownHosts.md) | Parses OpenSSH `known_hosts` content into structured entries. Comment and blank lines are skipped. Lines that cannot be parsed are silently dropped so callers can tolerate hand-edited files. |
| [parseMlsdLine](functions/parseMlsdLine.md) | Parses a single MLSD or MLST fact line. |
| [parseMlsdList](functions/parseMlsdList.md) | Parses an MLSD directory listing into normalized remote entries. |
| [parseMlstTimestamp](functions/parseMlstTimestamp.md) | Parses the UTC timestamp format used by MLST/MLSD `modify` facts. |
| [parseOpenSshConfig](functions/parseOpenSshConfig.md) | Parses OpenSSH `ssh_config` text into structured `Host` blocks. |
| [parseRemoteManifest](functions/parseRemoteManifest.md) | Parses a JSON-encoded manifest, validating the schema version and entry shape. |
| [parseUnixList](functions/parseUnixList.md) | Parses a Unix-style FTP `LIST` response into normalized remote entries. |
| [parseUnixListLine](functions/parseUnixListLine.md) | Parses one Unix-style FTP `LIST` line. |
| [redactCommand](functions/redactCommand.md) | Redacts sensitive FTP command payloads while preserving the command name. |
| [redactConnectionProfile](functions/redactConnectionProfile.md) | Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted. |
| [redactObject](functions/redactObject.md) | Redacts sensitive keys and nested values in a plain object. |
| [redactSecretSource](functions/redactSecretSource.md) | Redacts a secret source or resolved secret for safe diagnostics. |
| [redactValue](functions/redactValue.md) | Recursively redacts strings, arrays, and plain object values. |
| [resolveConnectionProfileSecrets](functions/resolveConnectionProfileSecrets.md) | Resolves credential and TLS material secret sources without mutating the original profile. |
| [resolveOpenSshHost](functions/resolveOpenSshHost.md) | Resolves the merged option set for an OpenSSH host alias. |
| [resolveProviderId](functions/resolveProviderId.md) | Resolves the provider id from a profile, preferring the new `provider` field. |
| [resolveSecret](functions/resolveSecret.md) | Resolves a secret source into a string or Buffer without logging the value. |
| [runConnectionDiagnostics](functions/runConnectionDiagnostics.md) | Connects to a profile, captures capability and listing samples, and returns a redaction-safe report. |
| [runRoute](functions/runRoute.md) | Executes an MFT route as a single transfer through the supplied client. |
| [runSshCommand](functions/runSshCommand.md) | Connects, authenticates, runs `command` on a fresh exec channel, drains stdout, and disconnects. The TCP socket, transport, auth session, and channel are all owned by this helper and torn down before it returns. |
| [serializeRemoteManifest](functions/serializeRemoteManifest.md) | Serializes a manifest to a JSON string suitable for persistence. |
| [signWebhookPayload](functions/signWebhookPayload.md) | Computes the HMAC-SHA256 signature for a webhook payload. |
| [sortRemoteEntries](functions/sortRemoteEntries.md) | Returns a copy of the supplied entries sorted by the requested key. Directories are grouped before files within ascending sorts, matching common file-manager UX. |
| [summarizeClientDiagnostics](functions/summarizeClientDiagnostics.md) | Returns a redaction-safe snapshot of the providers registered with a client. |
| [summarizeError](functions/summarizeError.md) | Serializes an unknown error into the audit-friendly `{ message, name, code }` shape. |
| [summarizeTransferPlan](functions/summarizeTransferPlan.md) | Summarizes a transfer plan for diagnostics, previews, and tests. |
| [throttleByteIterable](functions/throttleByteIterable.md) | Wraps an async iterable of byte chunks so each chunk is released only after the throttle has admitted its byte count. |
| [uploadFile](functions/uploadFile.md) | Uploads a single local file to a remote endpoint. |
| [validateConnectionProfile](functions/validateConnectionProfile.md) | Validates provider-neutral connection profile fields before provider lookup. |
| [validateSchedule](functions/validateSchedule.md) | Validates a schedule and returns it for fluent setup. |
| [walkRemoteTree](functions/walkRemoteTree.md) | Walks a remote file system depth-first, yielding entries in a stable order. |

## Classes

| Class | Description |
| ------ | ------ |
| [AbortError](classes/AbortError.md) | Error raised when an operation is cancelled by an AbortSignal or caller action. |
| [ApprovalRegistry](classes/ApprovalRegistry.md) | In-memory approval registry. |
| [ApprovalRejectedError](classes/ApprovalRejectedError.md) | Error raised when an approval request is rejected. |
| [AuthenticationError](classes/AuthenticationError.md) | Error raised when authentication credentials are rejected. |
| [AuthorizationError](classes/AuthorizationError.md) | Error raised when authenticated credentials are not authorized for an operation. |
| [ConfigurationError](classes/ConfigurationError.md) | Error raised when user-provided options or paths are invalid before network I/O. |
| [ConnectionError](classes/ConnectionError.md) | Error raised when a remote connection cannot be opened or is lost unexpectedly. |
| [FtpResponseParser](classes/FtpResponseParser.md) | Stateful parser for socket-delivered FTP response text. |
| [InMemoryAuditLog](classes/InMemoryAuditLog.md) | In-memory implementation of [MftAuditLog](interfaces/MftAuditLog.md). |
| [MftScheduler](classes/MftScheduler.md) | Runs routes on configured schedules. |
| [ParseError](classes/ParseError.md) | Error raised when protocol text or metadata cannot be parsed safely. |
| [PathAlreadyExistsError](classes/PathAlreadyExistsError.md) | Error raised when a create or rename operation targets an existing path. |
| [PathNotFoundError](classes/PathNotFoundError.md) | Error raised when a requested remote path does not exist. |
| [PermissionDeniedError](classes/PermissionDeniedError.md) | Error raised when the remote server denies access to a path or command. |
| [ProtocolError](classes/ProtocolError.md) | Error raised when a server response violates protocol expectations. |
| [ProviderRegistry](classes/ProviderRegistry.md) | Mutable registry of provider factories available to a transfer client. |
| [RouteRegistry](classes/RouteRegistry.md) | Mutable in-memory registry of MFT routes. |
| [ScheduleRegistry](classes/ScheduleRegistry.md) | Mutable in-memory registry of MFT schedules. |
| [SshAuthSession](classes/SshAuthSession.md) | Runs SSH user authentication over an encrypted transport connection. |
| [SshConnectionManager](classes/SshConnectionManager.md) | - |
| [SshDataReader](classes/SshDataReader.md) | Stateful SSH primitive decoder that reads sequential values from a packet payload. |
| [SshDataWriter](classes/SshDataWriter.md) | Minimal SSH primitive encoder for transport and authentication packets. |
| [SshSessionChannel](classes/SshSessionChannel.md) | A single SSH session channel. Not safe to share across concurrent callers; each SftpSession should own one. |
| [SshTransportConnection](classes/SshTransportConnection.md) | Live SSH transport connection over a TCP socket. |
| [SshTransportHandshake](classes/SshTransportHandshake.md) | Client-side SSH handshake coordinator for version exchange and KEXINIT negotiation. |
| [TimeoutError](classes/TimeoutError.md) | Error raised when an operation exceeds its configured timeout. |
| [TransferClient](classes/TransferClient.md) | Small provider-neutral client that owns provider lookup and connection setup. |
| [TransferEngine](classes/TransferEngine.md) | Executes transfer jobs and produces audit-friendly receipts. |
| [TransferError](classes/TransferError.md) | Error raised when an upload, download, or stream transfer fails. |
| [TransferQueue](classes/TransferQueue.md) | Minimal transfer queue with concurrency, pause/resume, cancellation, and drain summaries. |
| [UnsupportedFeatureError](classes/UnsupportedFeatureError.md) | Error raised when a requested protocol feature is not implemented or unavailable. |
| [VerificationError](classes/VerificationError.md) | Error raised when post-transfer verification fails. |
| [ZeroTransfer](classes/ZeroTransfer.md) | SDK entry point for FTP, FTPS, and SFTP workflows. |
| [ZeroTransferError](classes/ZeroTransferError.md) | Base class for all typed ZeroTransfer errors. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [AgeRetentionPolicy](interfaces/AgeRetentionPolicy.md) | Retention policy that evicts entries older than `maxAgeMs`. |
| [ApprovalRequest](interfaces/ApprovalRequest.md) | Approval request record. |
| [AtomicDeployActivateStep](interfaces/AtomicDeployActivateStep.md) | Kind of activation step described by the plan. |
| [AtomicDeployPlan](interfaces/AtomicDeployPlan.md) | Result returned by [createAtomicDeployPlan](functions/createAtomicDeployPlan.md). |
| [AtomicDeployPruneStep](interfaces/AtomicDeployPruneStep.md) | Pruning step describing an old release directory marked for deletion. |
| [AzureBlobProviderOptions](interfaces/AzureBlobProviderOptions.md) | Options accepted by [createAzureBlobProviderFactory](functions/createAzureBlobProviderFactory.md). |
| [BandwidthThrottle](interfaces/BandwidthThrottle.md) | Token-bucket throttle used to pace transfer chunks. |
| [BandwidthThrottleOptions](interfaces/BandwidthThrottleOptions.md) | Construction overrides for deterministic tests. |
| [Base64EnvSecretSource](interfaces/Base64EnvSecretSource.md) | Environment variable descriptor for base64-encoded binary secrets. |
| [BuiltinCapabilityMatrixEntry](interfaces/BuiltinCapabilityMatrixEntry.md) | Single entry in the built-in capability matrix. |
| [CapabilitySet](interfaces/CapabilitySet.md) | Capability snapshot advertised by a provider factory and active session. |
| [ClientDiagnostics](interfaces/ClientDiagnostics.md) | Snapshot of the providers registered with a client. |
| [CompareRemoteManifestsOptions](interfaces/CompareRemoteManifestsOptions.md) | Options accepted by [compareRemoteManifests](functions/compareRemoteManifests.md). |
| [ConnectionDiagnosticsResult](interfaces/ConnectionDiagnosticsResult.md) | Result returned by [runConnectionDiagnostics](functions/runConnectionDiagnostics.md). |
| [ConnectionDiagnosticTimings](interfaces/ConnectionDiagnosticTimings.md) | Per-step duration measurements collected by [runConnectionDiagnostics](functions/runConnectionDiagnostics.md). |
| [ConnectionPoolOptions](interfaces/ConnectionPoolOptions.md) | Options for [createPooledTransferClient](functions/createPooledTransferClient.md). |
| [ConnectionProfile](interfaces/ConnectionProfile.md) | Connection settings accepted by facade and adapter implementations. |
| [ConventionEndpoint](interfaces/ConventionEndpoint.md) | Endpoint shape used by [createInboxRoute](functions/createInboxRoute.md)/[createOutboxRoute](functions/createOutboxRoute.md). |
| [CopyBetweenOptions](interfaces/CopyBetweenOptions.md) | Options for [copyBetween](functions/copyBetween.md). |
| [CountRetentionPolicy](interfaces/CountRetentionPolicy.md) | Retention policy that retains the newest `maxCount` entries. |
| [CreateApprovalGateOptions](interfaces/CreateApprovalGateOptions.md) | Options accepted by [createApprovalGate](functions/createApprovalGate.md). |
| [CreateAtomicDeployPlanOptions](interfaces/CreateAtomicDeployPlanOptions.md) | Options accepted by [createAtomicDeployPlan](functions/createAtomicDeployPlan.md). |
| [CreateInboxRouteOptions](interfaces/CreateInboxRouteOptions.md) | Options accepted by [createInboxRoute](functions/createInboxRoute.md). |
| [CreateOutboxRouteOptions](interfaces/CreateOutboxRouteOptions.md) | Options accepted by [createOutboxRoute](functions/createOutboxRoute.md). |
| [CreateRemoteBrowserOptions](interfaces/CreateRemoteBrowserOptions.md) | Options accepted by [createRemoteBrowser](functions/createRemoteBrowser.md). |
| [CreateRemoteManifestOptions](interfaces/CreateRemoteManifestOptions.md) | Options accepted by [createRemoteManifest](functions/createRemoteManifest.md). |
| [CreateSyncPlanOptions](interfaces/CreateSyncPlanOptions.md) | Options accepted by [createSyncPlan](functions/createSyncPlan.md). |
| [CreateWebhookAuditLogOptions](interfaces/CreateWebhookAuditLogOptions.md) | Options accepted by [createWebhookAuditLog](functions/createWebhookAuditLog.md). |
| [CronExpression](interfaces/CronExpression.md) | Compiled cron expression. |
| [CronScheduleTrigger](interfaces/CronScheduleTrigger.md) | Fires at times matching a 5-field cron expression (minute hour dom month dow). |
| [DiffRemoteTreesOptions](interfaces/DiffRemoteTreesOptions.md) | Options accepted by [diffRemoteTrees](functions/diffRemoteTrees.md). |
| [DispatchWebhookOptions](interfaces/DispatchWebhookOptions.md) | Options accepted by [dispatchWebhook](functions/dispatchWebhook.md). |
| [DispatchWebhookResult](interfaces/DispatchWebhookResult.md) | Result returned by [dispatchWebhook](functions/dispatchWebhook.md). |
| [DownloadFileOptions](interfaces/DownloadFileOptions.md) | Options for [downloadFile](functions/downloadFile.md). |
| [DropboxProviderOptions](interfaces/DropboxProviderOptions.md) | Options accepted by [createDropboxProviderFactory](functions/createDropboxProviderFactory.md). |
| [EnvSecretSource](interfaces/EnvSecretSource.md) | Environment variable descriptor for text secrets. |
| [EvaluateRetentionOptions](interfaces/EvaluateRetentionOptions.md) | Options accepted by [evaluateRetention](functions/evaluateRetention.md). |
| [FileSecretSource](interfaces/FileSecretSource.md) | File-backed secret descriptor. |
| [FileSystemS3MultipartResumeStoreOptions](interfaces/FileSystemS3MultipartResumeStoreOptions.md) | Options for [createFileSystemS3MultipartResumeStore](functions/createFileSystemS3MultipartResumeStore.md). |
| [FileZillaSite](interfaces/FileZillaSite.md) | Imported FileZilla site with the folder hierarchy that contained it. |
| [FtpFeatures](interfaces/FtpFeatures.md) | Normalized server features returned by an FTP FEAT command. |
| [FtpProviderOptions](interfaces/FtpProviderOptions.md) | Options used to create the classic FTP provider factory. |
| [FtpReplyErrorInput](interfaces/FtpReplyErrorInput.md) | Input used to map an FTP reply into a structured ZeroTransfer error. |
| [FtpResponse](interfaces/FtpResponse.md) | Complete parsed FTP response. |
| [FtpsProviderOptions](interfaces/FtpsProviderOptions.md) | Options used to create the FTPS provider factory. |
| [GcsProviderOptions](interfaces/GcsProviderOptions.md) | Options accepted by [createGcsProviderFactory](functions/createGcsProviderFactory.md). |
| [GoogleDriveProviderOptions](interfaces/GoogleDriveProviderOptions.md) | Options accepted by [createGoogleDriveProviderFactory](functions/createGoogleDriveProviderFactory.md). |
| [HttpProviderOptions](interfaces/HttpProviderOptions.md) | Options accepted by [createHttpProviderFactory](functions/createHttpProviderFactory.md). |
| [ImportFileZillaSitesResult](interfaces/ImportFileZillaSitesResult.md) | Result returned by [importFileZillaSites](functions/importFileZillaSites.md). |
| [ImportOpenSshConfigOptions](interfaces/ImportOpenSshConfigOptions.md) | Options accepted by [importOpenSshConfig](functions/importOpenSshConfig.md). |
| [ImportOpenSshConfigResult](interfaces/ImportOpenSshConfigResult.md) | Result of [importOpenSshConfig](functions/importOpenSshConfig.md). |
| [ImportWinScpSessionsResult](interfaces/ImportWinScpSessionsResult.md) | Result of [importWinScpSessions](functions/importWinScpSessions.md). |
| [IntervalScheduleTrigger](interfaces/IntervalScheduleTrigger.md) | Repeats every `everyMs` milliseconds from a fixed reference point. |
| [JsonlWriter](interfaces/JsonlWriter.md) | Output sink consumed by [createJsonlAuditLog](functions/createJsonlAuditLog.md). |
| [KnownHostsEntry](interfaces/KnownHostsEntry.md) | Parsed entry from an OpenSSH `known_hosts` file. |
| [ListOptions](interfaces/ListOptions.md) | Options for remote directory listing operations. |
| [LocalProviderOptions](interfaces/LocalProviderOptions.md) | Options used to create a local file-system provider factory. |
| [LogRecord](interfaces/LogRecord.md) | Complete structured log record emitted by ZeroTransfer helpers. |
| [LogRecordInput](interfaces/LogRecordInput.md) | Log record input accepted by [emitLog](functions/emitLog.md); the helper adds the level. |
| [MemoryProviderEntry](interfaces/MemoryProviderEntry.md) | Fixture entry used to seed a memory provider instance. |
| [MemoryProviderOptions](interfaces/MemoryProviderOptions.md) | Options used to create a deterministic memory provider factory. |
| [MftAuditEntry](interfaces/MftAuditEntry.md) | Audit record emitted by route execution. |
| [MftAuditLog](interfaces/MftAuditLog.md) | Append-only audit log surface. |
| [MftInboxConvention](interfaces/MftInboxConvention.md) | Inbox layout convention. |
| [MftOutboxConvention](interfaces/MftOutboxConvention.md) | Outbox layout convention. |
| [MftRoute](interfaces/MftRoute.md) | Declarative source→destination policy bound to provider profiles. |
| [MftRouteEndpoint](interfaces/MftRouteEndpoint.md) | Endpoint inside an MFT route. |
| [MftRouteFilter](interfaces/MftRouteFilter.md) | Optional filter metadata reserved for tree-aware route execution. |
| [MftSchedule](interfaces/MftSchedule.md) | Declarative schedule binding a route id to a trigger. |
| [MftSchedulerOptions](interfaces/MftSchedulerOptions.md) | Construction options for [MftScheduler](classes/MftScheduler.md). |
| [MkdirOptions](interfaces/MkdirOptions.md) | Options for creating a remote directory. |
| [NegotiatedSshAlgorithms](interfaces/NegotiatedSshAlgorithms.md) | Selected algorithms after intersecting client preferences with server capabilities. |
| [OAuthAccessToken](interfaces/OAuthAccessToken.md) | Token material returned by [OAuthRefreshCallback](type-aliases/OAuthRefreshCallback.md). |
| [OAuthTokenSecretSourceOptions](interfaces/OAuthTokenSecretSourceOptions.md) | Options accepted by [createOAuthTokenSecretSource](functions/createOAuthTokenSecretSource.md). |
| [OneDriveProviderOptions](interfaces/OneDriveProviderOptions.md) | Options accepted by [createOneDriveProviderFactory](functions/createOneDriveProviderFactory.md). |
| [OpenSshConfigEntry](interfaces/OpenSshConfigEntry.md) | Parsed `Host` block from an OpenSSH config file. |
| [PooledTransferClient](interfaces/PooledTransferClient.md) | Pool-aware [TransferClient](classes/TransferClient.md) returned by [createPooledTransferClient](functions/createPooledTransferClient.md). |
| [ProgressEventInput](interfaces/ProgressEventInput.md) | Input used to create a transfer progress event. |
| [ProviderFactory](interfaces/ProviderFactory.md) | Factory registered with [ProviderRegistry](classes/ProviderRegistry.md) to create providers on demand. |
| [ProviderSelection](interfaces/ProviderSelection.md) | Minimal shape used to resolve a provider from new and compatibility profile fields. |
| [ProviderTransferExecutorOptions](interfaces/ProviderTransferExecutorOptions.md) | Options for [createProviderTransferExecutor](functions/createProviderTransferExecutor.md). |
| [ProviderTransferOperations](interfaces/ProviderTransferOperations.md) | Optional read/write surface exposed by provider sessions that support transfer streaming. |
| [ProviderTransferReadRequest](interfaces/ProviderTransferReadRequest.md) | Request passed to provider read implementations. |
| [ProviderTransferReadResult](interfaces/ProviderTransferReadResult.md) | Result returned by provider read implementations. |
| [ProviderTransferRequest](interfaces/ProviderTransferRequest.md) | Shared provider transfer request fields. |
| [ProviderTransferSessionResolverInput](interfaces/ProviderTransferSessionResolverInput.md) | Input passed to provider transfer session resolvers. |
| [ProviderTransferWriteRequest](interfaces/ProviderTransferWriteRequest.md) | Request passed to provider write implementations. |
| [RemoteBreadcrumb](interfaces/RemoteBreadcrumb.md) | Crumb describing one segment in the current path. |
| [RemoteBrowser](interfaces/RemoteBrowser.md) | Stateful directory browser returned by [createRemoteBrowser](functions/createRemoteBrowser.md). |
| [RemoteBrowserSnapshot](interfaces/RemoteBrowserSnapshot.md) | Snapshot returned by browser navigation methods. |
| [RemoteEntry](interfaces/RemoteEntry.md) | Normalized remote file-system entry. |
| [RemoteFileAdapter](interfaces/RemoteFileAdapter.md) | Minimal remote-file adapter required by the current alpha facade. |
| [RemoteFileEndpoint](interfaces/RemoteFileEndpoint.md) | Endpoint shape accepted by the friendly helpers. |
| [RemoteFileSystem](interfaces/RemoteFileSystem.md) | Minimal file-system surface shared by provider sessions. |
| [RemoteManifest](interfaces/RemoteManifest.md) | Persisted snapshot of a remote subtree. |
| [RemoteManifestEntry](interfaces/RemoteManifestEntry.md) | Manifest entry recorded for each visited remote node. |
| [RemotePermissions](interfaces/RemotePermissions.md) | Portable permission metadata for a remote entry. |
| [RemoteStat](interfaces/RemoteStat.md) | Metadata for a remote entry that is known to exist. |
| [RemoteTreeDiff](interfaces/RemoteTreeDiff.md) | Result returned by [diffRemoteTrees](functions/diffRemoteTrees.md). |
| [RemoteTreeDiffEntry](interfaces/RemoteTreeDiffEntry.md) | Single diff record produced by [diffRemoteTrees](functions/diffRemoteTrees.md). |
| [RemoteTreeDiffSummary](interfaces/RemoteTreeDiffSummary.md) | Compact summary of a diff result. |
| [RemoteTreeEntry](interfaces/RemoteTreeEntry.md) | Walk record yielded by [walkRemoteTree](functions/walkRemoteTree.md). |
| [RemoveOptions](interfaces/RemoveOptions.md) | Options for removing a remote file entry. |
| [RenameOptions](interfaces/RenameOptions.md) | Options for renaming or moving a remote entry. |
| [ResolvedConnectionProfile](interfaces/ResolvedConnectionProfile.md) | Connection profile with username, password, TLS, and SSH material sources resolved. |
| [ResolvedOpenSshHost](interfaces/ResolvedOpenSshHost.md) | Resolved set of directives for a given host alias. Values from later-declared blocks are merged after earlier ones so wildcard fallbacks (e.g. `Host *`) only fill gaps. |
| [ResolvedSshProfile](interfaces/ResolvedSshProfile.md) | SSH profile with private-key and known-host material resolved. |
| [ResolvedTlsProfile](interfaces/ResolvedTlsProfile.md) | TLS profile with certificate-bearing secret sources resolved. |
| [ResolveSecretOptions](interfaces/ResolveSecretOptions.md) | Injectable dependencies used by tests or host applications during secret resolution. |
| [RetentionEvaluation](interfaces/RetentionEvaluation.md) | Result returned by [evaluateRetention](functions/evaluateRetention.md). |
| [RmdirOptions](interfaces/RmdirOptions.md) | Options for removing a remote directory. |
| [RunConnectionDiagnosticsOptions](interfaces/RunConnectionDiagnosticsOptions.md) | Options accepted by [runConnectionDiagnostics](functions/runConnectionDiagnostics.md). |
| [RunRouteOptions](interfaces/RunRouteOptions.md) | Options accepted by [runRoute](functions/runRoute.md). |
| [RunSshCommandOptions](interfaces/RunSshCommandOptions.md) | Options for [runSshCommand](functions/runSshCommand.md). |
| [RunSshCommandResult](interfaces/RunSshCommandResult.md) | Result of [runSshCommand](functions/runSshCommand.md). The full captured stdout is provided as both a `Buffer` (for binary output) and as a UTF-8 decoded `string`. |
| [S3MultipartCheckpoint](interfaces/S3MultipartCheckpoint.md) | Persisted multipart-upload checkpoint. |
| [S3MultipartOptions](interfaces/S3MultipartOptions.md) | Multipart upload tuning for the S3 provider. |
| [S3MultipartPart](interfaces/S3MultipartPart.md) | Single part recorded in a multipart-upload checkpoint. |
| [S3MultipartResumeKey](interfaces/S3MultipartResumeKey.md) | Resume key identifying an in-flight multipart upload. |
| [S3MultipartResumeStore](interfaces/S3MultipartResumeStore.md) | Persistence contract for resuming partial multipart uploads across processes or retries. Implementations may be synchronous or asynchronous; `clear` is invoked once the multipart upload completes successfully (or is explicitly aborted). |
| [S3ProviderOptions](interfaces/S3ProviderOptions.md) | Options accepted by [createS3ProviderFactory](functions/createS3ProviderFactory.md). |
| [ScheduleTimerHooks](interfaces/ScheduleTimerHooks.md) | Timer hooks injected by tests so fake clocks stay deterministic. |
| [SftpProviderOptions](interfaces/SftpProviderOptions.md) | Options for [createNativeSftpProviderFactory](functions/createSftpProviderFactory.md). |
| [SftpRawSession](interfaces/SftpRawSession.md) | Low-level handles exposed by a native SFTP session for diagnostics and advanced extension. Most applications should use the [TransferSession](interfaces/TransferSession.md) returned from `client.connect()` instead. |
| [SshAlgorithmPreferences](interfaces/SshAlgorithmPreferences.md) | Algorithm lists exchanged during SSH KEXINIT negotiation. |
| [SshKeyboardInteractiveChallenge](interfaces/SshKeyboardInteractiveChallenge.md) | Input passed to SSH keyboard-interactive answer providers. |
| [SshKeyboardInteractiveCredential](interfaces/SshKeyboardInteractiveCredential.md) | - |
| [SshKeyboardInteractivePrompt](interfaces/SshKeyboardInteractivePrompt.md) | Prompt metadata supplied by an SSH keyboard-interactive server challenge. |
| [SshPasswordCredential](interfaces/SshPasswordCredential.md) | - |
| [SshProfile](interfaces/SshProfile.md) | SSH authentication material for SFTP-style providers. |
| [SshPublickeyCredential](interfaces/SshPublickeyCredential.md) | - |
| [SshSocketFactoryContext](interfaces/SshSocketFactoryContext.md) | Context passed to SSH socket factories before opening an SSH session. |
| [SshTransportConnectionOptions](interfaces/SshTransportConnectionOptions.md) | - |
| [SshTransportHandshakeResult](interfaces/SshTransportHandshakeResult.md) | Initial client-side handshake state before key exchange math starts. |
| [StatOptions](interfaces/StatOptions.md) | Options for remote metadata lookup operations. |
| [SyncEndpointInput](interfaces/SyncEndpointInput.md) | Endpoint shape supplied to [createSyncPlan](functions/createSyncPlan.md). |
| [TlsProfile](interfaces/TlsProfile.md) | TLS settings shared by certificate-aware providers such as FTPS and future HTTPS/WebDAV adapters. |
| [TransferAttempt](interfaces/TransferAttempt.md) | Execution attempt retained in a transfer receipt. |
| [TransferAttemptError](interfaces/TransferAttemptError.md) | Serializable error summary retained in failed attempts. |
| [TransferBandwidthLimit](interfaces/TransferBandwidthLimit.md) | Optional throughput limit shape that concrete transfer executors may honor. |
| [TransferByteRange](interfaces/TransferByteRange.md) | Byte range requested from a readable provider endpoint. |
| [TransferClientOptions](interfaces/TransferClientOptions.md) | Options used to create a provider-neutral transfer client. |
| [TransferEndpoint](interfaces/TransferEndpoint.md) | Endpoint referenced by a transfer job or receipt. |
| [TransferEngineExecuteOptions](interfaces/TransferEngineExecuteOptions.md) | Options used by [TransferEngine.execute](classes/TransferEngine.md#execute). |
| [TransferEngineOptions](interfaces/TransferEngineOptions.md) | Construction options for deterministic tests and host integration. |
| [TransferExecutionContext](interfaces/TransferExecutionContext.md) | Context passed to a concrete transfer operation. |
| [TransferExecutionResult](interfaces/TransferExecutionResult.md) | Result returned by a transfer operation implementation. |
| [TransferJob](interfaces/TransferJob.md) | Transfer job input consumed by [TransferEngine](classes/TransferEngine.md). |
| [TransferPlan](interfaces/TransferPlan.md) | Provider-neutral transfer plan. |
| [TransferPlanInput](interfaces/TransferPlanInput.md) | Input used to create a transfer plan. |
| [TransferPlanStep](interfaces/TransferPlanStep.md) | Step inside a transfer plan. |
| [TransferPlanSummary](interfaces/TransferPlanSummary.md) | Summary of a transfer plan. |
| [TransferProgressEvent](interfaces/TransferProgressEvent.md) | Progress snapshot emitted while a transfer is running. |
| [TransferProvider](interfaces/TransferProvider.md) | Provider implementation that can open transfer sessions. |
| [TransferQueueItem](interfaces/TransferQueueItem.md) | Enqueued transfer job state. |
| [TransferQueueOptions](interfaces/TransferQueueOptions.md) | Options used to create a transfer queue. |
| [TransferQueueRunOptions](interfaces/TransferQueueRunOptions.md) | Options used when draining a queue. |
| [TransferQueueSummary](interfaces/TransferQueueSummary.md) | Summary returned after a queue drain. |
| [TransferReceipt](interfaces/TransferReceipt.md) | Audit-friendly receipt for a completed transfer job. |
| [TransferResult](interfaces/TransferResult.md) | Final summary for a completed transfer. |
| [TransferResultInput](interfaces/TransferResultInput.md) | Input used to create a final transfer result. |
| [TransferRetryDecisionInput](interfaces/TransferRetryDecisionInput.md) | Input used by retry policy hooks. |
| [TransferRetryPolicy](interfaces/TransferRetryPolicy.md) | Retry policy for transfer execution. |
| [TransferSession](interfaces/TransferSession.md) | Connected provider session exposed through [TransferClient.connect](classes/TransferClient.md#connect). |
| [TransferTimeoutPolicy](interfaces/TransferTimeoutPolicy.md) | Timeout policy applied by the transfer engine. |
| [TransferVerificationResult](interfaces/TransferVerificationResult.md) | Normalized post-transfer verification details. |
| [UploadFileOptions](interfaces/UploadFileOptions.md) | Options for [uploadFile](functions/uploadFile.md). |
| [ValueSecretSource](interfaces/ValueSecretSource.md) | Inline secret descriptor. Prefer env, path, or callback sources for real applications. |
| [WalkRemoteTreeOptions](interfaces/WalkRemoteTreeOptions.md) | Options accepted by [walkRemoteTree](functions/walkRemoteTree.md). |
| [WebDavProviderOptions](interfaces/WebDavProviderOptions.md) | Options accepted by [createWebDavProviderFactory](functions/createWebDavProviderFactory.md). |
| [WebhookRetryPolicy](interfaces/WebhookRetryPolicy.md) | Retry policy for webhook deliveries. |
| [WebhookSignature](interfaces/WebhookSignature.md) | Signature payload produced by [signWebhookPayload](functions/signWebhookPayload.md). |
| [WebhookTarget](interfaces/WebhookTarget.md) | Webhook destination. |
| [WinScpSession](interfaces/WinScpSession.md) | Imported WinSCP session entry. |
| [ZeroTransferCapabilities](interfaces/ZeroTransferCapabilities.md) | Lightweight capability snapshot for the current client instance. |
| [ZeroTransferErrorDetails](interfaces/ZeroTransferErrorDetails.md) | Complete set of fields required to create a ZeroTransfer error. |
| [ZeroTransferLogger](interfaces/ZeroTransferLogger.md) | Partial structured logger accepted by ZeroTransfer. |
| [ZeroTransferOptions](interfaces/ZeroTransferOptions.md) | Construction options for a [ZeroTransfer](classes/ZeroTransfer.md) instance. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [ApprovalStatus](type-aliases/ApprovalStatus.md) | Lifecycle status of an approval request. |
| [AtomicDeployActivateOperation](type-aliases/AtomicDeployActivateOperation.md) | Operation kind for an activation step. |
| [AtomicDeployStrategy](type-aliases/AtomicDeployStrategy.md) | Activation strategy used to swap a staged release into place. |
| [AuthenticationCapability](type-aliases/AuthenticationCapability.md) | Authentication mechanisms a provider can advertise. |
| [BandwidthSleep](type-aliases/BandwidthSleep.md) | Sleep helper signature used by [createBandwidthThrottle](functions/createBandwidthThrottle.md). |
| [BuiltInProviderId](type-aliases/BuiltInProviderId.md) | Provider ids reserved for first-party ZeroTransfer adapters. |
| [BuiltinProviderMatrixId](type-aliases/BuiltinProviderMatrixId.md) | Identifier for an entry in [getBuiltinCapabilityMatrix](functions/getBuiltinCapabilityMatrix.md). |
| [ChecksumCapability](type-aliases/ChecksumCapability.md) | Checksum or integrity mechanisms a provider can advertise. |
| [ClassicProviderId](type-aliases/ClassicProviderId.md) | Provider ids that map directly to the original protocol-focused alpha facade. |
| [CronField](type-aliases/CronField.md) | Compiled cron field as a sorted set of allowed integer values. |
| [FriendlyTransferOptions](type-aliases/FriendlyTransferOptions.md) | Shared options consumed by [uploadFile](functions/uploadFile.md), [downloadFile](functions/downloadFile.md), and [copyBetween](functions/copyBetween.md). |
| [FtpPassiveHostStrategy](type-aliases/FtpPassiveHostStrategy.md) | Host selection strategy for PASV data endpoints. |
| [FtpResponseStatus](type-aliases/FtpResponseStatus.md) | FTP response status family derived from the first digit of the reply code. |
| [FtpsDataProtection](type-aliases/FtpsDataProtection.md) | FTPS data-channel protection level requested after TLS negotiation. |
| [FtpsMode](type-aliases/FtpsMode.md) | FTPS control-channel TLS mode. |
| [HttpFetch](type-aliases/HttpFetch.md) | Fetch implementation accepted by web-family providers. |
| [KnownHostsMarker](type-aliases/KnownHostsMarker.md) | Marker prefixing a known_hosts line (`@cert-authority` or `@revoked`). |
| [LoggerMethod](type-aliases/LoggerMethod.md) | Logger method signature used for each severity level. |
| [LogLevel](type-aliases/LogLevel.md) | Supported ZeroTransfer log levels. |
| [MetadataCapability](type-aliases/MetadataCapability.md) | Metadata fields a provider can preserve or report. |
| [MftAuditEntryType](type-aliases/MftAuditEntryType.md) | Discriminator describing the lifecycle event being recorded. |
| [MftRouteOperation](type-aliases/MftRouteOperation.md) | Transfer operations supported by route executors. |
| [MftScheduleTrigger](type-aliases/MftScheduleTrigger.md) | Combined trigger union accepted by [MftSchedule](interfaces/MftSchedule.md). |
| [OAuthRefreshCallback](type-aliases/OAuthRefreshCallback.md) | Refresh callback invoked when no valid cached token is available. |
| [ProviderId](type-aliases/ProviderId.md) | Provider identifier accepted by registries, profiles, and provider factories. |
| [ProviderTransferEndpointRole](type-aliases/ProviderTransferEndpointRole.md) | Endpoint role used while resolving provider sessions for a transfer job. |
| [ProviderTransferSessionResolver](type-aliases/ProviderTransferSessionResolver.md) | Resolves the connected provider session that owns an endpoint. |
| [ProviderTransferWriteResult](type-aliases/ProviderTransferWriteResult.md) | Result returned by provider write implementations. |
| [RemoteBrowserFilter](type-aliases/RemoteBrowserFilter.md) | Filter callback applied to a directory listing. |
| [RemoteEntrySortKey](type-aliases/RemoteEntrySortKey.md) | Sort key supported by [sortRemoteEntries](functions/sortRemoteEntries.md). |
| [RemoteEntrySortOrder](type-aliases/RemoteEntrySortOrder.md) | Sort direction supported by [sortRemoteEntries](functions/sortRemoteEntries.md). |
| [RemoteEntryType](type-aliases/RemoteEntryType.md) | Normalized remote entry kinds returned by listing and metadata operations. |
| [RemoteProtocol](type-aliases/RemoteProtocol.md) | Supported remote file-transfer protocols. |
| [RemoteTreeDiffReason](type-aliases/RemoteTreeDiffReason.md) | Reason an entry is considered modified. |
| [RemoteTreeDiffStatus](type-aliases/RemoteTreeDiffStatus.md) | Outcome category for an entry across the two compared trees. |
| [RemoteTreeFilter](type-aliases/RemoteTreeFilter.md) | Filter callback applied to each visited entry. Returning `false` skips the entry. |
| [RetentionPolicy](type-aliases/RetentionPolicy.md) | Combined retention policy union accepted by [evaluateRetention](functions/evaluateRetention.md). |
| [ScheduleRouteRunner](type-aliases/ScheduleRouteRunner.md) | Function shape used to fire a route. Defaults to [runRoute](functions/runRoute.md). |
| [SecretProvider](type-aliases/SecretProvider.md) | Callback source used by applications to integrate vaults or credential brokers. |
| [SecretSource](type-aliases/SecretSource.md) | Secret source accepted by profile credential fields. |
| [SecretValue](type-aliases/SecretValue.md) | Resolved secret value accepted by profile credential fields. |
| [SpecializedErrorDetails](type-aliases/SpecializedErrorDetails.md) | Error construction input for subclasses that provide default codes. |
| [SshAgentSource](type-aliases/SshAgentSource.md) | SSH agent source accepted by SFTP providers. |
| [SshAlgorithms](type-aliases/SshAlgorithms.md) | SSH transport algorithm overrides accepted by SFTP providers. |
| [SshDisconnectReason](type-aliases/SshDisconnectReason.md) | Standard SSH disconnect reason codes (RFC 4253 §11.1). |
| [SshKeyboardInteractiveHandler](type-aliases/SshKeyboardInteractiveHandler.md) | Provides ordered answers for an SSH keyboard-interactive authentication challenge. |
| [SshKnownHostsSource](type-aliases/SshKnownHostsSource.md) | Known-hosts material source accepted by SSH connection profiles. |
| [SshSocketFactory](type-aliases/SshSocketFactory.md) | Creates a preconnected socket-like stream for SSH sessions. |
| [SyncConflictPolicy](type-aliases/SyncConflictPolicy.md) | How [createSyncPlan](functions/createSyncPlan.md) reacts to entries flagged as modified on both sides. |
| [SyncDeletePolicy](type-aliases/SyncDeletePolicy.md) | How [createSyncPlan](functions/createSyncPlan.md) reacts to entries that exist only on the destination. |
| [SyncDirection](type-aliases/SyncDirection.md) | Sync direction used by [createSyncPlan](functions/createSyncPlan.md). |
| [TlsSecretSource](type-aliases/TlsSecretSource.md) | TLS material source accepted by certificate-aware connection profiles. |
| [TransferDataChunk](type-aliases/TransferDataChunk.md) | Binary chunk shape used by provider transfer streams. |
| [TransferDataSource](type-aliases/TransferDataSource.md) | Provider-neutral transfer content source. Node readable streams satisfy this shape. |
| [TransferExecutor](type-aliases/TransferExecutor.md) | Concrete transfer operation implementation used by the engine. |
| [TransferOperation](type-aliases/TransferOperation.md) | Provider-neutral transfer operation names. |
| [TransferPlanAction](type-aliases/TransferPlanAction.md) | Non-executing plan action used to explain an intentionally skipped step. |
| [TransferQueueExecutorResolver](type-aliases/TransferQueueExecutorResolver.md) | Resolver used when jobs do not provide an executor at enqueue time. |
| [TransferQueueItemStatus](type-aliases/TransferQueueItemStatus.md) | Queue item lifecycle state. |

## Variables

| Variable | Description |
| ------ | ------ |
| [CLASSIC\_PROVIDER\_IDS](variables/CLASSIC_PROVIDER_IDS.md) | Classic remote-transfer providers kept compatible with the original protocol field. |
| [DEFAULT\_FAILED\_SUBDIR](variables/DEFAULT_FAILED_SUBDIR.md) | Default subdirectory used to quarantine files that failed processing. |
| [DEFAULT\_PROCESSED\_SUBDIR](variables/DEFAULT_PROCESSED_SUBDIR.md) | Default subdirectory used to archive successfully processed inbox files. |
| [DEFAULT\_SSH\_ALGORITHM\_PREFERENCES](variables/DEFAULT_SSH_ALGORITHM_PREFERENCES.md) | Baseline algorithm order for the initial native SSH transport implementation. |
| [noopLogger](variables/noopLogger.md) | Logger implementation that intentionally drops every record. |
| [REDACTED](variables/REDACTED.md) | Placeholder used when sensitive content has been removed. |
| [REMOTE\_MANIFEST\_FORMAT\_VERSION](variables/REMOTE_MANIFEST_FORMAT_VERSION.md) | Schema version for the manifest payload. Bumped on incompatible format changes. |
| [SshDisconnectReason](variables/SshDisconnectReason.md) | Standard SSH disconnect reason codes (RFC 4253 §11.1). |

## References

### createNativeSftpProviderFactory

Renames and re-exports [createSftpProviderFactory](functions/createSftpProviderFactory.md)

***

### NativeSftpProviderOptions

Renames and re-exports [SftpProviderOptions](interfaces/SftpProviderOptions.md)

***

### NativeSftpRawSession

Renames and re-exports [SftpRawSession](interfaces/SftpRawSession.md)

***

### ProviderAuthenticationCapability

Renames and re-exports [AuthenticationCapability](type-aliases/AuthenticationCapability.md)

***

### ProviderCapabilities

Renames and re-exports [CapabilitySet](interfaces/CapabilitySet.md)

***

### ProviderChecksumCapability

Renames and re-exports [ChecksumCapability](type-aliases/ChecksumCapability.md)

***

### ProviderMetadataCapability

Renames and re-exports [MetadataCapability](type-aliases/MetadataCapability.md)
