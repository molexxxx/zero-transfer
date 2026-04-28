// @ts-check
/**
 * Manifest mapping each future scoped package to its eventual public surface.
 *
 * Today every stub re-exports the full @zero-transfer/sdk; this manifest is
 * the source of truth for the per-scope docs and READMEs that describe what
 * each package will narrow to. When a scope graduates to its own narrowed
 * surface, update the `exports` list here and regenerate the docs.
 *
 * `examples` references files under examples/ (relative to repo root) that
 * showcase the scope.
 */

/**
 * @typedef {object} ScopeDefinition
 * @property {string} name        Package name suffix (e.g. "core", "ftp").
 * @property {string} title       Human-friendly title.
 * @property {string} summary     One-line summary for tables/cards.
 * @property {string} description Multi-line description for the package page.
 * @property {string[]} exports   Names of exports (functions, types, classes) that belong to the eventual surface.
 * @property {string[]} examples  Example files relevant to this scope.
 */

/** @type {ScopeDefinition[]} */
export const scopes = [
  {
    description:
      "The provider-neutral foundation: `TransferClient`, `createTransferClient`, the provider registry, capability sets, transfer engine, queue, planning primitives, profile resolution, secret redaction, structured logging, and typed errors. Every other scoped package builds on this surface.",
    examples: ["transfer-queue.ts", "dry-run-sync.ts", "diagnose-connection.ts"],
    exports: [
      "TransferClient",
      "TransferClientOptions",
      "createTransferClient",
      "ProviderRegistry",
      "TransferSession",
      "TransferProvider",
      "ProviderCapabilities",
      "ProviderFactory",
      "ProviderTransferOperations",
      "RemoteFileSystem",
      "CapabilitySet",
      "AuthenticationCapability",
      "ChecksumCapability",
      "MetadataCapability",
      "BuiltInProviderId",
      "ProviderId",
      "ProviderSelection",
      "TransferEngine",
      "TransferQueue",
      "TransferJob",
      "TransferPlan",
      "TransferReceipt",
      "TransferEndpoint",
      "TransferOperation",
      "TransferAttempt",
      "TransferRetryPolicy",
      "TransferTimeoutPolicy",
      "TransferBandwidthLimit",
      "TransferVerificationResult",
      "createBandwidthThrottle",
      "createProviderTransferExecutor",
      "createTransferJobsFromPlan",
      "createTransferPlan",
      "summarizeTransferPlan",
      "throttleByteIterable",
      "validateConnectionProfile",
      "resolveConnectionProfileSecrets",
      "redactConnectionProfile",
      "redactSecretSource",
      "resolveSecret",
      "createOAuthTokenSecretSource",
      "ZeroTransferError",
      "ZeroTransferLogger",
      "noopLogger",
      "emitLog",
    ],
    name: "core",
    summary: "Provider-neutral contracts, transfer engine, queue, profiles, and errors.",
    title: "Core — provider-neutral SDK",
  },
  {
    description:
      "Bundle of the three classic providers: FTP, FTPS, and SFTP. Wire `createFtpProviderFactory()`, `createFtpsProviderFactory()`, and `createSftpProviderFactory()` into a single `TransferClient` to talk to traditional file servers.",
    examples: ["sftp-private-key.ts", "ftps-client-certificate.ts"],
    exports: [
      "createFtpProviderFactory",
      "createFtpsProviderFactory",
      "createSftpProviderFactory",
      "createSftpJumpHostSocketFactory",
      "FtpProviderOptions",
      "FtpsProviderOptions",
      "SftpProviderOptions",
      "SftpJumpHostOptions",
    ],
    name: "classic",
    summary: "FTP, FTPS, and SFTP providers in one install.",
    title: "Classic — FTP / FTPS / SFTP",
  },
  {
    description:
      "Plain FTP with EPSV/PASV streaming, REST-resume, MLST/MLSD listings, Unix LIST fallback, and full profile timeout enforcement. Use `createFtpProviderFactory()`.",
    examples: ["transfer-queue.ts"],
    exports: [
      "createFtpProviderFactory",
      "FtpProviderOptions",
      "FtpPassiveHostStrategy",
      "FtpResponse",
      "FtpResponseStatus",
      "FtpFeatures",
      "FtpResponseParser",
      "parseFtpFeatures",
      "parseFtpResponseLines",
      "parseMlsdLine",
      "parseMlsdList",
      "parseMlstTimestamp",
      "parseUnixList",
      "parseUnixListLine",
    ],
    name: "ftp",
    summary: "Classic FTP provider with EPSV/PASV streaming and REST resume.",
    title: "FTP",
  },
  {
    description:
      "FTPS over explicit `AUTH TLS` or implicit TLS, with PEM/PFX/P12 certificate sources, encrypted passive data channels, certificate fingerprint pinning, SNI/servername controls, and TLS min/max version configuration.",
    examples: ["ftps-client-certificate.ts"],
    exports: ["createFtpsProviderFactory", "FtpsProviderOptions", "FtpsMode", "FtpsDataProtection"],
    name: "ftps",
    summary: "Explicit and implicit FTPS with full TLS profile support.",
    title: "FTPS",
  },
  {
    description:
      "SFTP over SSH with password / private-key / agent / keyboard-interactive authentication, SSH algorithm overrides, OpenSSH `known_hosts` parsing, SHA-256 host-key pinning, custom socket factories, and a first-class jump-host helper for bastion-mediated connections.",
    examples: ["sftp-private-key.ts"],
    exports: [
      "createSftpProviderFactory",
      "createSftpJumpHostSocketFactory",
      "SftpProviderOptions",
      "SftpJumpHostOptions",
      "SftpRawSession",
      "matchKnownHosts",
      "matchKnownHostsEntry",
      "parseKnownHosts",
      "KnownHostsEntry",
      "KnownHostsMarker",
    ],
    name: "sftp",
    summary: "SFTP with SSH key auth, known_hosts, and jump-host support.",
    title: "SFTP",
  },
  {
    description:
      "Read-only HTTP(S) provider with HEAD-based metadata, ranged GET resume, Basic auth, Bearer-token auth via secret sources, and ETag exposed as both `uniqueId` and read-result `checksum`. Useful for signed-URL downloads and CDN ingest.",
    examples: ["signed-url-download.ts"],
    exports: ["createHttpProviderFactory", "HttpProviderOptions", "HttpFetch"],
    name: "http",
    summary: "HTTP(S) and signed-URL provider with ranged downloads.",
    title: "HTTP(S)",
  },
  {
    description:
      "WebDAV provider — PROPFIND-based `list`/`stat`, ranged GET, PUT uploads, Basic auth, and ETag preservation. Speaks remote filesystem semantics over HTTP.",
    examples: ["webdav-sync.ts"],
    exports: ["createWebDavProviderFactory", "WebDavProviderOptions"],
    name: "webdav",
    summary: "WebDAV provider with PROPFIND listings and ranged downloads.",
    title: "WebDAV",
  },
  {
    description:
      "S3-compatible object storage provider with SigV4 signing, multipart upload, and cross-process multipart resume. Supports AWS S3, MinIO, R2, Wasabi, Backblaze B2 S3, DigitalOcean Spaces, and any custom endpoint that speaks the S3 API. Includes the in-memory resume store; persistent stores can be swapped in.",
    examples: ["s3-compatible-upload.ts", "multi-cloud-orchestration.ts"],
    exports: [
      "createS3ProviderFactory",
      "createMemoryS3MultipartResumeStore",
      "S3ProviderOptions",
      "S3MultipartOptions",
      "S3MultipartResumeStore",
      "S3MultipartResumeKey",
      "S3MultipartCheckpoint",
      "S3MultipartPart",
    ],
    name: "s3",
    summary: "S3-compatible storage with SigV4, multipart upload, and resume.",
    title: "S3-compatible object storage",
  },
  {
    description:
      "Google Drive provider over OAuth bearer tokens — paginated folder listings from a configurable root folder id, ranged downloads via `alt=media`, single-shot multipart uploads, and `md5Checksum` exposed as both `uniqueId` and `checksum`.",
    examples: ["multi-cloud-orchestration.ts"],
    exports: ["createGoogleDriveProviderFactory", "GoogleDriveProviderOptions"],
    name: "google-drive",
    summary: "Google Drive provider with OAuth, folder paths, and md5 checksums.",
    title: "Google Drive",
  },
  {
    description:
      "Dropbox provider — RPC + content-host APIs, list-folder cursor pagination, ranged downloads, single-shot uploads in `overwrite` mode, and `content_hash` exposed as both `uniqueId` and `checksum`.",
    examples: [],
    exports: ["createDropboxProviderFactory", "DropboxProviderOptions"],
    name: "dropbox",
    summary: "Dropbox provider with content-hash verification.",
    title: "Dropbox",
  },
  {
    description:
      "Azure Blob Storage provider — SAS-token or AAD bearer auth, container-scoped paginated listings, HEAD-based stat, ranged downloads, and single-shot block-blob uploads. Wire OAuth refresh via `createOAuthTokenSecretSource()`.",
    examples: ["multi-cloud-orchestration.ts"],
    exports: ["createAzureBlobProviderFactory", "AzureBlobProviderOptions"],
    name: "azure-blob",
    summary: "Azure Blob Storage with SAS or AAD bearer auth.",
    title: "Azure Blob",
  },
  {
    description:
      "Managed File Transfer workflow primitives: routes, schedules (interval + cron), inbox/outbox conventions, retention policies, audit logs (in-memory, JSONL, fan-out, webhook-backed), HMAC-signed webhook delivery, and approval gates that require human sign-off before a scheduled run executes.",
    examples: ["mft-route.ts", "approval-gated-route.ts", "atomic-deploy-with-rollback.ts"],
    exports: [
      "MftRoute",
      "RouteRegistry",
      "runRoute",
      "MftSchedule",
      "ScheduleRegistry",
      "MftScheduler",
      "parseCronExpression",
      "nextScheduleFireAt",
      "createInboxRoute",
      "createOutboxRoute",
      "inboxProcessedPath",
      "inboxFailedPath",
      "evaluateRetention",
      "AgeRetentionPolicy",
      "CountRetentionPolicy",
      "InMemoryAuditLog",
      "createJsonlAuditLog",
      "composeAuditLogs",
      "freezeReceipt",
      "summarizeError",
      "MftAuditLog",
      "MftAuditEntry",
      "dispatchWebhook",
      "signWebhookPayload",
      "createWebhookAuditLog",
      "WebhookTarget",
      "WebhookRetryPolicy",
      "ApprovalRegistry",
      "createApprovalGate",
      "ApprovalRejectedError",
    ],
    name: "mft",
    summary: "Routes, schedules, audit logs, webhooks, approval gates.",
    title: "MFT — Managed File Transfer workflows",
  },
];
