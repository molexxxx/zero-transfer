# ZeroTransfer Hard Replan

Date: 2026-04-27

Current repo/package state: `@zero-transfer/sdk` / `ZeroTransfer` in the `tonywied17/zero-transfer` repository after the Phase 0 and Phase 1 foundation work. The `zero-transfer` npm organization exists, package metadata and lockfile are scoped to `@zero-transfer/sdk`, and the release workflow is ready to publish to npmjs with a repository secret named `NPM_TOKEN`. `ZeroFTP` remains available as a temporary compatibility export while the provider-neutral API is established.

New product direction: a protocol-neutral, TypeScript-first file transfer SDK. FTP, FTPS, and SFTP are important provider adapters, not the identity of the whole project.

Chosen working brand: `ZeroTransfer` with npm organization scope `@zero-transfer` and first package `@zero-transfer/sdk`, still subject to normal domain and trademark diligence before 1.0.

This document replaces the prior FTP-first remake plan. The naming and package-scope decision is accepted; the next implementation phase should start with provider-neutral contracts, memory/local providers, profile/secret handling, and contract tests.

## 1. Hard Pivot Decision

The previous plan still treated the project as an FTP/FTPS/SFTP SDK with future expansion notes. That is too narrow for the product we want developers to notice.

The new plan is:

- Build a universal file transfer SDK around providers, profiles, transfer jobs, remote file-system semantics, security policy, diagnostics, and MFT-style workflows.
- Treat FTP, FTPS, SFTP, HTTP(S), WebDAV, S3-compatible object storage, cloud drives, and local file systems as adapters behind one core model.
- Make the public API read like a modern transfer platform, not a protocol wrapper.
- Preserve protocol escape hatches for advanced users without letting raw FTP/SFTP concepts dominate the main API.
- Design profiles and secrets around real GUI-client needs, including WinSCP, FileZilla, OpenSSH, TLS certificates, PFX/P12 bundles, known_hosts, proxies, jump hosts, and cloud credentials.

Decision:

- Public package/repo: `@zero-transfer/sdk` in the `tonywied17/zero-transfer` repository.
- Public scope owner: npm organization `zero-transfer`.
- Preferred public class/factory: `ZeroTransfer` and `createTransferClient()`.
- Legacy package names `molex-ftp` and `zero-ftp` are migration history, not the forward product identity.
- Keep `ZeroFTP` only as a short-term compatibility export while the provider-neutral core is introduced.

The first scoped publish should claim `@zero-transfer/sdk` before deeper package splitting begins.

## 2. Product Goal

ZeroTransfer should become a professional Node.js SDK for moving, syncing, inspecting, auditing, and automating files across many storage and transfer systems.

The library should help developers build:

- Deployment pipelines.
- File browsers and admin UIs.
- Backup and sync tools.
- Managed file transfer workflows.
- Data ingestion and export jobs.
- Cross-provider copy/move tools.
- Release artifact uploaders.
- Secure partner exchange systems.

North-star value:

- One typed API for many file-transfer backends.
- Secure profile handling across passwords, SSH keys, PEMs, certificates, tokens, service accounts, and cloud credential chains.
- Streaming transfers with backpressure, resumability, verification, and progress events.
- Dry-run plans before destructive changes.
- Provider capability discovery so developers know what each backend supports.
- Strong diagnostics that explain whether DNS, TCP, TLS, SSH, OAuth, login, permissions, passive mode, API quota, or metadata parsing failed.
- Audit-friendly transfer receipts and structured logs.

## 3. Scope Model

### Core SDK

The core SDK owns provider-neutral behavior:

- Public client API.
- Provider registry.
- Connection profiles.
- Secret and credential resolution.
- Capability model.
- Remote file-system contracts.
- Transfer engine.
- Transfer queues.
- Planning and sync diffing.
- Retry and resume policy.
- Logging, tracing, metrics, and audit records.
- Typed errors.
- Security policies.

### Provider Families

Provider families implement concrete systems behind the core contracts:

- Classic transfer: FTP, explicit FTPS, implicit FTPS, SFTP.
- Web transfer: HTTP(S), signed URLs, WebDAV.
- Object storage: AWS S3, S3-compatible APIs, MinIO, Cloudflare R2, Backblaze B2 S3, Wasabi, DigitalOcean Spaces.
- Cloud storage: Google Drive, Dropbox, OneDrive/SharePoint, Azure Blob, Google Cloud Storage.
- Local and virtual: local file system, memory provider for tests, archive provider later if useful.
- MFT workflows: inbox/outbox, routes, schedules, approvals, retention, webhooks, receipts, audit trails.

### What Not To Do First

- Do not implement every provider at once.
- Do not let cloud APIs block the classic protocol rewrite.
- Do not make FTP the public architecture center.
- Do not make MFT enterprise workflow features required for the first alpha.
- Do not expose provider-specific settings as random top-level options.

## 4. Package Strategy

### Recommended Path

Start as one scoped package until the contracts prove themselves:

```text
@zero-transfer/sdk
```

The `zero-transfer` npm organization has been created. The first package claims the scope with a batteries-included SDK that can include core contracts plus classic providers. Split later only when package size, optional dependencies, or provider cadence justify it.

### First Publish Path

- Publish `@zero-transfer/sdk` to the public npm registry only.
- Keep `publishConfig.registry` set to `https://registry.npmjs.org/`.
- Keep `publishConfig.access` set to `public` for the scoped package.
- Prefer GitHub Actions release publishing with provenance.
- Use the repository secret `NPM_TOKEN` for token-based test publishing; never commit npm tokens or put them in local npm config.
- Do not publish an unscoped `zero-transfer` package unless there is a deliberate compatibility or discoverability reason later.

### Future Monorepo Shape

If the SDK expands, use scoped packages:

```text
@zero-transfer/core
@zero-transfer/classic
@zero-transfer/ftp
@zero-transfer/ftps
@zero-transfer/sftp
@zero-transfer/http
@zero-transfer/webdav
@zero-transfer/s3
@zero-transfer/google-drive
@zero-transfer/dropbox
@zero-transfer/azure-blob
@zero-transfer/mft
```

Keep `@zero-transfer/sdk` as the batteries-included distribution only if users prefer one install:

```text
@zero-transfer/sdk
```

### Dependency Policy

- Core should stay lean and avoid provider dependencies.
- FTP/FTPS can use Node built-ins first.
- SFTP should use `ssh2` or a mature SSH implementation. Do not hand-roll SSH/SFTP.
- Cloud providers may need official SDKs or lightweight HTTP clients. Keep them isolated in provider packages or optional imports.
- If optional providers are missing dependencies, fail with clear setup errors.

## 5. Target Repository Structure

The next source layout should represent a transfer platform, not an FTP client.

```text
src/
  index.ts

  core/
    TransferClient.ts
    createTransferClient.ts
    ProviderRegistry.ts
    TransferSession.ts
    ConnectionProfile.ts
    CapabilitySet.ts
    ProviderId.ts
    OperationContext.ts

  profiles/
    ProfileStore.ts
    ProfileValidator.ts
    ProfileRedactor.ts
    SecretSource.ts
    CredentialSource.ts
    CertificateSource.ts
    ProxyProfile.ts
    importers/
      OpenSshConfigImporter.ts
      KnownHostsParser.ts
      FileZillaImporter.ts
      WinScpImporter.ts

  auth/
    secrets/
      resolveSecret.ts
      redactSecret.ts
      SecretResolver.ts
    tls/
      TlsProfile.ts
      CertificateLoader.ts
      FingerprintVerifier.ts
    ssh/
      SshProfile.ts
      PrivateKeyLoader.ts
      KnownHostsVerifier.ts
      SshAgentResolver.ts
    oauth/
      OAuthProfile.ts
      TokenProvider.ts
      TokenRefreshPolicy.ts
    cloud/
      AwsCredentialSource.ts
      AzureCredentialSource.ts
      GoogleCredentialSource.ts

  providers/
    Provider.ts
    ProviderCapabilities.ts
    ProviderFactory.ts
    classic/
      ftp/
        FtpProvider.ts
        FtpControlConnection.ts
        FtpDataConnection.ts
        FtpCommandQueue.ts
        FtpResponseParser.ts
        FtpFeatureParser.ts
        FtpListParser.ts
      ftps/
        FtpsProvider.ts
        FtpsTlsNegotiator.ts
      sftp/
        SftpProvider.ts
        SftpMetadataMapper.ts
    web/
      http/
        HttpProvider.ts
        SignedUrlProvider.ts
      webdav/
        WebDavProvider.ts
    object-storage/
      s3/
        S3Provider.ts
        S3MultipartTransfer.ts
      azure-blob/
        AzureBlobProvider.ts
      gcs/
        GcsProvider.ts
    cloud-drive/
      dropbox/
        DropboxProvider.ts
      google-drive/
        GoogleDriveProvider.ts
      one-drive/
        OneDriveProvider.ts
    local/
      LocalFileSystemProvider.ts
      MemoryProvider.ts

  filesystem/
    RemotePath.ts
    RemoteEntry.ts
    RemoteStat.ts
    MetadataMapper.ts
    PathPolicy.ts
    GlobMatcher.ts
    TreeWalker.ts

  transfers/
    TransferEngine.ts
    TransferJob.ts
    TransferQueue.ts
    TransferPlanner.ts
    TransferPlan.ts
    TransferReceipt.ts
    TransferProgress.ts
    TransferPipeline.ts
    ResumeStore.ts
    IntegrityVerifier.ts
    ChecksumService.ts
    BandwidthLimiter.ts

  sync/
    SyncPlanner.ts
    SyncExecutor.ts
    ConflictResolver.ts
    ManifestService.ts
    DirectoryDiff.ts

  mft/
    Route.ts
    Schedule.ts
    Inbox.ts
    Outbox.ts
    Approval.ts
    RetentionPolicy.ts
    AuditLog.ts
    WebhookEmitter.ts

  diagnostics/
    ConnectionDiagnostic.ts
    CapabilityProbe.ts
    HandshakeTrace.ts
    TroubleshootingHint.ts

  observability/
    Logger.ts
    redaction.ts
    Metrics.ts
    Tracing.ts
    EventBus.ts

  errors/
    ZeroTransferError.ts
    errorFactory.ts
    providerErrors.ts

  utils/
    abort.ts
    byteSize.ts
    deferred.ts
    time.ts
    ids.ts

test/
  unit/
  contract/
  integration/
  fixtures/
    ftp/
    sftp/
    webdav/
    s3/
    profiles/
  servers/
    FakeFtpServer.ts
    FakeSftpServer.ts
    FakeHttpStorageServer.ts
    docker-compose.yml
```

This structure intentionally keeps classic protocols under `providers/classic/`. FTP internals can be deep and serious without becoming the top-level architecture.

## 6. Public API Direction

### Primary Client

```ts
import { createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient();

const session = await client.connect({
  provider: "sftp",
  host: "files.example.com",
  username: { env: "SFTP_USER" },
  password: { env: "SFTP_PASSWORD" },
  ssh: {
    knownHosts: { path: "./known_hosts" },
    strictHostKeyChecking: true,
  },
});

const plan = await session.plan.sync({
  from: { localPath: "./dist" },
  to: { remotePath: "/releases/app" },
  deleteExtra: false,
});

await session.transfers.applyPlan(plan, {
  concurrency: 4,
  verify: "size-and-checksum-when-supported",
  onProgress: (event) => console.info(event),
});

await session.disconnect();
```

### Method Families

Connection and profiles:

- `client.connect(profile)`
- `client.profiles.create(input)`
- `client.profiles.validate(profile)`
- `client.profiles.redact(profile)`
- `client.profiles.test(profile)`
- `client.profiles.fromEnv(prefix)`
- `client.profiles.fromOpenSshConfig(path)`
- `client.profiles.fromKnownHosts(path)`
- `client.profiles.fromFileZilla(path)`
- `client.profiles.fromWinScp(path)` where format support is practical

Remote filesystem:

- `session.fs.list(path, options)`
- `session.fs.stat(path)`
- `session.fs.exists(path)`
- `session.fs.walk(path)`
- `session.fs.glob(pattern)`
- `session.fs.mkdir(path)`
- `session.fs.ensureDir(path)`
- `session.fs.remove(path)`
- `session.fs.rename(from, to)`
- `session.fs.copy(from, to)` when provider supports server-side copy
- `session.fs.chmod(path, mode)` when supported
- `session.fs.realpath(path)` when supported

Transfers:

- `session.transfers.uploadFile(localPath, remotePath, options)`
- `session.transfers.downloadFile(remotePath, localPath, options)`
- `session.transfers.uploadStream(stream, remotePath, options)`
- `session.transfers.downloadStream(remotePath, options)`
- `session.transfers.copyBetween(sourceSession, targetSession, options)`
- `session.transfers.resume(jobId)`
- `session.transfers.verify(result)`
- `session.transfers.receipt(result)`

Planning and sync:

- `session.plan.upload(input)`
- `session.plan.download(input)`
- `session.plan.sync(input)`
- `session.plan.delete(input)`
- `session.plan.compareTrees(input)`
- `session.plan.apply(plan)`
- `session.sync.once(input)`
- `session.sync.continuous(input)`
- `session.sync.manifest(input)`

Queues:

- `client.queue.create(options)`
- `queue.add(job)`
- `queue.pause()`
- `queue.resume()`
- `queue.cancel(jobId)`
- `queue.retry(jobId)`
- `queue.setConcurrency(count)`
- `queue.setBandwidthLimit(bytesPerSecond)`
- `queue.on("progress", handler)`

Diagnostics:

- `client.diagnoseConnection(profile)`
- `client.probeCapabilities(profile)`
- `session.diagnostics.traceHandshake()`
- `session.diagnostics.testPathAccess(path)`
- `session.diagnostics.explain(error)`

MFT workflows:

- `client.mft.route(input)`
- `client.mft.schedule(input)`
- `client.mft.inbox(name)`
- `client.mft.outbox(name)`
- `client.mft.auditLog(query)`
- `client.mft.retention(policy)`
- `client.mft.webhook(target)`

Provider escape hatches:

- `session.raw()` returns a provider-specific advanced interface.
- Raw operations must still apply timeout, abort, logging, and redaction rules where possible.

## 7. Capability Model

Every provider must advertise what it can do. The core should never guess.

Example capabilities:

```ts
interface ProviderCapabilities {
  provider: string;
  authentication: string[];
  list: boolean;
  stat: boolean;
  readStream: boolean;
  writeStream: boolean;
  serverSideCopy: boolean;
  serverSideMove: boolean;
  resumeDownload: boolean;
  resumeUpload: boolean;
  checksum: string[];
  atomicRename: boolean;
  chmod: boolean;
  chown: boolean;
  symlink: boolean;
  metadata: string[];
  maxConcurrency?: number;
  notes?: string[];
}
```

Capability-driven behavior:

- If S3 supports multipart upload, use multipart-specific resume.
- If FTP supports `REST`, enable FTP resume.
- If a provider cannot preserve modified time, report that in the plan.
- If server-side copy is unavailable, fall back to stream-through-copy only when the caller allows it.
- If checksum support is unavailable, use size/time verification or local hash only.

## 8. Connection Profiles, Keys, Certs, And Credentials

Profiles are a first-class product feature. This is where the SDK can feel better than raw protocol packages.

### Common Profile Fields

```ts
interface ConnectionProfile {
  id?: string;
  name?: string;
  provider: ProviderId;
  host?: string;
  port?: number;
  username?: SecretSource;
  password?: SecretSource;
  initialDirectory?: string;
  timeoutMs?: number;
  keepAlive?: KeepAlivePolicy;
  proxy?: ProxyProfile;
  retry?: RetryPolicy;
  tags?: string[];
  security?: SecurityPolicy;
}
```

### Secret Sources

```ts
type SecretSource =
  | string
  | Buffer
  | { path: string }
  | { env: string }
  | { base64Env: string }
  | { command: string; args?: string[] }
  | (() => Promise<string | Buffer> | string | Buffer);
```

Rules:

- Resolve secrets at connection time.
- Redact source descriptors and resolved values in logs, errors, traces, docs examples, and tests.
- Allow async providers so users can integrate vaults, keychains, KMS, CI secrets, and credential brokers.
- Never include secret values in thrown validation messages.

### FTPS Settings

Support WinSCP-grade FTPS settings:

- Explicit TLS and implicit TLS.
- TLS min/max version.
- CA bundle from inline PEM, Buffer, file path, env var, or provider callback.
- Client cert and key as PEM.
- Encrypted private-key passphrase.
- PFX/P12 bundle and passphrase.
- SNI/servername.
- `rejectUnauthorized` with secure default `true`.
- Custom server identity check.
- Pinned certificate fingerprint for private infrastructure.
- `PBSZ 0` and data channel protection with default `PROT P`.
- Optional `PROT C` only with explicit insecure opt-in.
- EPSV/PASV/active-mode strategy, passive host override, NAT workaround strategy, data-port range and timeouts.
- Proxy support through SOCKS, HTTP CONNECT, or custom socket factory.
- Encoding, keepalive, initial directory, reconnect behavior, and server compatibility flags.

### SFTP Settings

Support WinSCP/OpenSSH-grade SFTP settings:

- Password authentication.
- Private key authentication from inline OpenSSH/PEM text, Buffer, file path, env var, async provider, or agent.
- Encrypted private-key passphrase.
- ssh-agent and Pageant-compatible agent sockets where supported by platform and dependency.
- Keyboard-interactive auth for MFA-like prompts.
- Strict host key verification by default.
- OpenSSH `known_hosts` parsing.
- Pinned SHA256/MD5 host-key fingerprints.
- Custom host-key verifier callback.
- Documented insecure bypass for local throwaway tests only.
- SSH algorithm controls for ciphers, KEX, host key algorithms, MACs, compression, and legacy opt-ins.
- Jump host and bastion support.
- SOCKS/HTTP CONNECT proxy and custom socket factory.
- Keepalive interval/count, ready timeout, compression, initial directory, environment variables if supported, and path encoding behavior.
- Correct mapping for uid/gid, permissions, symlinks, realpath, lstat/stat, atomic rename, and SFTP status codes.

### HTTP(S), WebDAV, And API Settings

Support web-transfer settings:

- Basic auth, bearer tokens, API keys, custom headers, cookies when explicitly enabled, and signed URLs.
- mTLS with the same PEM/PFX/P12 certificate sources used by FTPS.
- Range requests, resumable downloads, upload chunking where supported, ETag verification, `If-Match`, and `If-None-Match` controls.
- HTTP proxy, SOCKS proxy, custom agent, retry-after handling, rate limit handling, redirect policy, and user-agent controls.
- WebDAV depth, lock/unlock support where practical, PROPFIND metadata mapping, MKCOL, MOVE, COPY, and server capability discovery.

### Object Storage Settings

Support S3-compatible and object-storage settings:

- Access key and secret key.
- Session token.
- Credential provider chain.
- AWS profile and region.
- STS assume role and web identity where practical.
- Custom endpoint.
- Force path style and virtual-hosted style.
- Bucket root mapping.
- Prefix root mapping.
- Multipart upload settings.
- Server-side encryption options.
- ETag, version id, storage class, metadata, tags, and checksum mapping.

### Cloud Drive Settings

Support cloud-drive settings:

- OAuth token provider.
- Refresh token provider.
- Service account or app credentials where supported.
- Shared drive, team drive, tenant, site, drive id, folder id, and namespace roots.
- Provider pagination, delta tokens, conflict behavior, and rate limit strategy.
- Capability maps for provider-specific constraints such as filename rules, path length, revision history, and server-side copy limits.

## 9. Transfer Engine

The transfer engine is the core product, not any one protocol parser.

Required transfer behavior:

- Stream-based upload and download.
- Backpressure via `stream.pipeline()`.
- AbortSignal support.
- Timeouts at connection, command/request, idle, and whole-job levels.
- Progress events with bytes, total when known, rate, ETA, phase, provider, source, destination, and job id.
- Resume where provider supports it.
- Multipart upload where provider supports it.
- Atomic upload where provider supports rename or compose.
- Verification by size, modified time, checksum, ETag, provider hash, or manifest.
- Retry with idempotency awareness.
- Local temp files and safe rename for downloads.
- Partial-file cleanup policy.
- Bandwidth limits.
- Concurrency limits.
- Receipts for audit and replay.

Transfer result shape:

```ts
interface TransferReceipt {
  transferId: string;
  provider: string;
  source: TransferEndpoint;
  destination: TransferEndpoint;
  bytesTransferred: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  averageBytesPerSecond: number;
  resumed: boolean;
  verified: boolean;
  verification?: VerificationResult;
  attempts: TransferAttempt[];
  warnings: string[];
}
```

## 10. Provider Priority

### Alpha Provider Set

Alpha should prove the architecture with providers that stress different parts of the core:

- Memory provider for deterministic contract tests.
- Local file-system provider for cross-provider copy and test fixtures.
- FTP provider for classic command/data-channel complexity.
- FTPS provider for TLS profiles and certificate handling.
- SFTP provider for SSH keys, known_hosts, permissions, and stat mapping.

### Beta Provider Set

- HTTP(S) provider with signed URLs, range downloads, ETag verification, mTLS, bearer tokens, and basic auth.
- WebDAV provider for remote filesystem semantics over HTTP.
- S3-compatible provider for object storage, multipart transfer, and cloud credential patterns.

### Later Provider Set

- Azure Blob.
- Google Cloud Storage.
- Dropbox.
- Google Drive.
- OneDrive/SharePoint.
- Backblaze native B2 if S3-compatible mode is insufficient.

## 11. Testing Strategy

Testing must be contract-first.

Test layers:

- Unit tests for pure utilities, parsers, profile validation, redaction, capability mapping, path logic, transfer planning, and error mapping.
- Provider contract tests that every provider must pass for the capabilities it advertises.
- Fake server tests for FTP/FTPS/SFTP/HTTP edge cases.
- Docker integration tests for real FTP, FTPS, SFTP, WebDAV, and S3-compatible storage.
- Cloud provider tests behind opt-in environment variables only.
- Security tests proving secrets never leak into logs, errors, traces, receipts, or validation messages.
- Transfer tests for abort, timeout, retry, resume, backpressure, partial cleanup, atomic upload, and verification.

Coverage gate stays 90%+ for implemented code.

Provider contract example:

```ts
describeProviderContract("sftp", createSftpProvider, {
  requires: ["list", "stat", "readStream", "writeStream", "rename"],
});
```

## 12. Documentation Strategy

Docs should sell the broader SDK clearly.

README positioning:

- `ZeroTransfer` is a TypeScript SDK for secure file transfer across classic protocols, web endpoints, object storage, and cloud drives.
- FTP/FTPS/SFTP are first-class providers, not the full product boundary.
- Show one API connecting to SFTP, S3, and WebDAV with the same transfer engine.

Required docs:

- Quick start.
- Provider matrix.
- Profiles and secrets guide.
- FTPS certificates guide.
- SFTP keys and known_hosts guide.
- HTTP(S) and signed URL guide.
- WebDAV guide.
- S3-compatible storage guide.
- Cloud drive provider guide.
- Transfer queues and progress guide.
- Sync and dry-run guide.
- Diagnostics guide.
- Security guide.
- MFT workflows guide.
- Migration from `molex-ftp` and `zero-ftp` to `@zero-transfer/sdk`.
- Generated API docs from JSDoc/TypeDoc.

Example files:

- `examples/sftp-private-key.ts`
- `examples/ftps-client-certificate.ts`
- `examples/s3-compatible-upload.ts`
- `examples/webdav-sync.ts`
- `examples/signed-url-download.ts`
- `examples/transfer-queue.ts`
- `examples/dry-run-sync.ts`
- `examples/mft-route.ts`
- `examples/profile-from-env.ts`
- `examples/diagnose-connection.ts`

## 13. New Phase Plan

### Phase 0B: Scoped Identity And Contract Reframe

Status: done enough to start the next implementation phase.

- Package metadata and lockfile use `@zero-transfer/sdk`.
- GitHub metadata points at `tonywied17/zero-transfer`.
- README, npm badges, package docs, and logo use ZeroTransfer language.
- Release workflow publishes the public scoped package with provenance and `NPM_TOKEN`.
- Public exports include `ZeroTransfer` as the preferred facade.
- `ZeroFTP` remains as a temporary compatibility export.
- Remaining rename cleanup should happen as part of the provider-neutral core refactor, not as isolated churn.

### Phase 0C: First Scoped npm Release

- Add the npm automation token as GitHub secret `NPM_TOKEN`, or configure trusted publishing if replacing token-based release.
- Run the release workflow or publish from an explicit test release to claim `@zero-transfer/sdk`.
- Confirm the npm package page resolves and shows the scoped package metadata.
- Rotate any token that has been pasted into chat or local terminals.
- Keep the initial release honest: alpha foundation, provider-neutral direction, compatibility facade, no claim of production-ready remote providers yet.

### Phase 1B: Provider-Neutral Foundation

Status: complete for the provider-neutral foundation slice. The foundation now has provider ids, capability sets, provider registry, provider contracts, `TransferClient`, `createTransferClient()`, exported provider-neutral types, `ConnectionProfile.provider` with `protocol` compatibility, deterministic memory and local providers, profile validation, secret source resolution, profile redaction, and an initial provider contract harness. Real network providers and the transfer engine remain later-phase work.

- Add `src/core/ProviderId.ts`, `CapabilitySet.ts`, `ProviderRegistry.ts`, `TransferSession.ts`, `TransferClient.ts`, and `createTransferClient.ts`.
- Add provider contracts under `src/providers/Provider.ts`, `ProviderCapabilities.ts`, `ProviderFactory.ts`, and `RemoteFileSystem.ts`.
- Replace the current adapter-first concept with provider-neutral contracts while keeping `RemoteFileAdapter` compatibility where it reduces churn.
- Introduce `ConnectionProfile.provider` while temporarily accepting `ConnectionProfile.protocol` for compatibility.
- Build `SecretSource`, secret resolution, profile validation, and profile redaction.
- Add the provider contract test harness and run it against memory and local providers.
- Add the local provider for deterministic filesystem tests.
- Export `createTransferClient()` through the friendly `ZeroTransfer` public entry point while keeping `ZeroFTP` compatibility.

### Phase 2: Transfer Core, Not FTP Core

- Build `TransferEngine`.
- Build `TransferJob` and `TransferQueue`.
- Build `TransferPlan` and dry-run planning primitives.
- Build progress events, receipts, retry policy, abort handling, timeout handling, and verification hooks.
- Keep provider operations minimal until the engine contract is stable.

### Phase 3: Classic Provider Pack

- Implement FTP provider using the existing parser-first work.
- Implement FTPS provider with full TLS profile support.
- Implement SFTP provider with SSH key, known_hosts, and permission mapping support.
- Add classic provider contract tests and Docker integration servers.
- Make WinSCP/FileZilla/OpenSSH profile importers optional and well-tested.

### Phase 4: Sync, Planning, And UI Helpers

- Implement tree walking and directory diffing.
- Implement sync plans and conflict policies.
- Implement manifest read/write/compare.
- Add browser helper models for file-manager UIs.
- Add atomic deploy workflows.

### Phase 5: Web And Object Storage Providers

- Add HTTP(S) provider.
- Add WebDAV provider.
- Add S3-compatible provider.
- Add multipart/resume support for object storage.
- Add provider-specific capability maps.

### Phase 6: Cloud Drive Providers

- Add Dropbox provider.
- Add Google Drive provider.
- Add OneDrive/SharePoint provider.
- Add Azure Blob and Google Cloud Storage providers if not already covered by object-storage abstractions.
- Add OAuth/token refresh documentation and opt-in integration tests.

### Phase 7: MFT Layer

- Add route definitions.
- Add schedules.
- Add inbox/outbox conventions.
- Add retention policies.
- Add audit logs and immutable receipts.
- Add webhooks.
- Add approval gates.

## 14. Alpha Definition Of Done

Alpha should not claim every provider. It should prove the platform shape.

Alpha is ready when:

- Scoped package identity is claimed or ready to claim as `@zero-transfer/sdk`.
- Public API is provider-neutral.
- Memory and local providers pass provider contracts.
- At least one classic remote provider passes provider contracts.
- Secrets, certs, keys, and profile redaction are tested.
- Transfer engine supports streaming, abort, progress, retry hooks, and receipts.
- Docs explain the provider architecture and roadmap honestly.
- CI runs lint, format check, typecheck, tests, coverage, build, docs, and package dry-run.
- Package publishes only to npmjs with provenance.

## 15. 1.0 Definition Of Done

1.0 is ready when:

- FTP, FTPS, and SFTP providers are production-ready.
- FTPS supports PEM, key, PFX/P12, CA, SNI, pinned fingerprint, and secure defaults.
- SFTP supports password, private key, passphrase, known_hosts, pinned host key, agent where possible, keyboard-interactive hooks, and strict host verification.
- HTTP(S), WebDAV, and S3-compatible providers are stable or explicitly beta-scoped.
- Transfer queue supports pause, resume, cancel, retry, concurrency, progress, bandwidth limits, and receipts.
- Sync planning supports dry run, conflict policy, deletion previews, and manifests.
- Provider capability matrix is documented.
- Security guide covers secret handling, cert validation, host keys, OAuth/token storage, insecure opt-ins, logs, and local path safety.
- Contract tests protect provider consistency.
- Integration tests cover real classic protocol servers and at least one object-storage-compatible server.
- API docs are generated and clean.
- README sells ZeroTransfer as a modern file transfer SDK, not an FTP wrapper.

## 16. Immediate Next Actions

1. Claim the package on npm by publishing the first scoped alpha as `@zero-transfer/sdk`, preferably through the GitHub Release workflow.
2. Start Phase 2 by adding transfer engine primitives: transfer job/result contracts, abort-aware execution, progress events, retry hooks, and receipts.
3. Keep `ZeroFTP` compatibility while gradually moving new examples and docs to `ZeroTransfer` and `createTransferClient()`.
4. Move FTP parser work under `providers/classic/ftp` only after the transfer/provider contracts are stable enough to host real adapters.
5. Add the first classic remote provider behind the contract harness after the transfer engine has a minimal shape.
6. Expand README examples only for APIs that exist in the current alpha surface.
