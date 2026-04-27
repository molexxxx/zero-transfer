# ZeroFTP Remake Plan

Date: 2026-04-27
Current package: `molex-ftp`
Target package and repo name: `zero-ftp`
Target public brand/class name: `ZeroFTP`

## 1. Product Goal

ZeroFTP should become a professional Node.js file-transfer SDK for building real FTP, FTPS, and SFTP clients. The library should not just expose raw protocol commands. It should provide a safe, typed, observable, well-tested, and ergonomic foundation for apps that need to browse, upload, download, sync, resume, inspect, and manage remote files at scale.

Primary goals:

- Publish only to npmjs as `zero-ftp`.
- Rename repository/package references from `molex-ftp` to `zero-ftp`.
- Support FTP, FTPS, and SFTP through a consistent high-level API.
- Provide first-class TypeScript support and generated API docs.
- Reach 90%+ test coverage with unit, integration, and protocol fixture tests.
- Provide verbose, structured errors, logging, debugging, metrics, and progress events.
- Use a cleaner OOP design with explicit protocol adapters and separation of concerns.
- Support QOL workflows needed by full FTP/SFTP client applications.
- Be secure by default: encrypted modes, host verification, redaction, safe path handling, timeouts, aborts, and no credential leaks.
- Be performant by default: streams, backpressure, queueing, retries, resume support, and no avoidable full-file buffering.

## 2. Current Repository Snapshot

Files currently present:

- `package.json`
- `index.js`
- `README.md`
- `CHANGELOG.md`
- `.npmignore`
- `test-comprehensive.js`
- `lib/FTPClient.js`
- `lib/connection.js`
- `lib/commands.js`
- `lib/performance.js`
- `lib/utils.js`

Current strengths:

- Small codebase and easy to understand.
- No runtime dependencies for basic FTP.
- Promise-based API.
- Passive-mode FTP transfer basics exist.
- Basic event emission exists.
- Good instincts around streaming downloads, debug logging, and simple directory helpers.
- The existing README already documents the intended user-facing value fairly well.

Current critical gaps:

- FTP only. No FTPS and no SFTP.
- CommonJS only, no TypeScript source, no `.d.ts`, no export map.
- No automated unit tests, no coverage, no CI, no release automation.
- `package.json` test script points to `node test.js`, but the repo has `test-comprehensive.js` instead.
- Package metadata still points at the old GitHub repo and package name.
- README says Node >=14, while `package.json` says Node >=12.
- No linting, formatting, type checking, security scanning, or package dry-run gate.
- No clear separation between protocol parsing, control channel, data channel, transfer orchestration, filesystem operations, logging, metrics, and high-level client behavior.

## 3. npm Ecosystem Research Snapshot

Checked packages from npm metadata on 2026-04-27:

- `basic-ftp` 5.3.0: FTP/FTPS, TLS, IPv6, async/await, TypeScript types. Strongest FTP competitor.
- `ssh2-sftp-client` 12.1.1: SFTP wrapper around `ssh2`. Good SFTP competitor, separate from FTP/FTPS.
- `ftp` 0.3.10: older FTP client with old dependencies.
- `promise-ftp` 1.3.5: promise wrapper around older FTP packages, dependency-heavy and dated.
- `zero-ftp`: npm returned 404 from this environment, so the name appears publicly unclaimed or unavailable only due to registry/account permissions.

Opportunity:

- Most users must choose separate packages for FTP/FTPS and SFTP.
- Older packages often expose protocol details without modern diagnostics, typed errors, robust metadata, or production-grade workflow helpers.
- A polished unified SDK with professional observability, strong TypeScript, predictable metadata, and client-building utilities can stand out.

Positioning:

- `basic-ftp` is a serious benchmark for FTP/FTPS correctness and TypeScript ergonomics.
- `ssh2-sftp-client` is a practical benchmark for SFTP coverage.
- ZeroFTP should compete by combining protocols, better DX, richer metadata, safer defaults, fuller client-building QOL features, and deeper diagnostics.

## 4. Audit Findings By Area

### 4.1 Package And Distribution

Problems:

- Package name is still `molex-ftp`.
- No `types` field.
- No `exports` map.
- No ESM build.
- No CJS/ESM dual package strategy.
- No `files` allowlist for npm publishing.
- `.npmignore` excludes `test.js`, but no `test.js` exists.
- No `prepack` or package validation.
- No npm provenance or trusted publishing workflow.

Recommended target:

- TypeScript source in `src/`.
- Build to `dist/` with dual ESM/CJS output.
- Use an explicit `exports` map.
- Publish only to npmjs.
- Use an npm `files` allowlist instead of relying on `.npmignore`.
- Add npm provenance and trusted publishing through GitHub Actions.

Example target package fields:

```json
{
  "name": "zero-ftp",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"],
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "provenance": true
  },
  "sideEffects": false,
  "engines": {
    "node": ">=20"
  }
}
```

Node version recommendation:

- Prefer Node >=20 for modern streams, stable AbortController behavior, current TLS defaults, and less compatibility drag.
- If adoption pressure requires it, consider Node >=18 as the lowest supported version, but only if CI and integration tests cover it.

### 4.2 Public API Design

Problems:

- Boolean parameters such as `ensureDir` and `recursive` are not self-documenting.
- Methods mix low-level FTP concepts with high-level file-management workflows.
- `delete(path)` is a problematic name because `delete` is a JavaScript operator and does not distinguish file vs directory.
- `cd()` mutates session state, which can surprise callers and makes concurrent operations risky.
- `stat()` returns incomplete and inconsistent metadata.
- `list()` returns raw strings, while `listDetailed()` uses brittle parsing.
- No AbortSignal support.
- No retry options.
- No progress callback/event shape.
- No transfer verification options.
- No capability discovery exposed to users.

Recommended API direction:

- Keep method names boring, explicit, and consistent.
- Use options objects instead of booleans.
- Make remote operations path-based and avoid changing working directory internally where possible.
- Return stable typed metadata objects.
- Support `AbortSignal` in every network or filesystem operation.
- Support progress callbacks and typed events.
- Keep raw protocol commands available under an advanced namespace, not the primary API.

Potential high-level API:

```ts
import { ZeroFTP } from "zero-ftp";

const client = await ZeroFTP.connect({
  protocol: "ftps",
  host: "ftp.example.com",
  username: "deploy",
  password: process.env.FTP_PASSWORD,
  secure: true,
  logger,
});

const entries = await client.list("/releases", {
  recursive: false,
  includeHidden: true,
});

await client.uploadFile("./dist/app.zip", "/releases/app.zip", {
  createParents: true,
  overwrite: true,
  atomic: true,
  preserveModifiedTime: true,
  onProgress: (event) => logger.info(event),
});

const info = await client.stat("/releases/app.zip");

await client.disconnect();
```

Recommended method families:

- Connection: `connect`, `disconnect`, `reconnect`, `noop`, `isConnected`, `getCapabilities`.
- Metadata: `stat`, `exists`, `list`, `walk`, `pwd`, `realpath`.
- Reads: `download`, `downloadFile`, `downloadStream`, `createReadStream`.
- Writes: `upload`, `uploadFile`, `uploadStream`, `createWriteStream`, `append`, `resumeUpload`.
- Management: `mkdir`, `ensureDir`, `removeFile`, `removeDir`, `remove`, `rename`, `move`, `chmod`, `chown`, `utimes` where supported.
- Workflows: `sync`, `mirror`, `copyFromLocal`, `copyToLocal`, `emptyDir`, `glob`, `compare`.
- Advanced: `raw.ftpCommand`, `raw.site`, `raw.sftpClient` where safe and documented.

### 4.3 Architecture And OOP Design

Current issue:

The current `FTPClient` delegates to `FTPConnection` and `FTPCommands`, but the design still revolves around a shared mutable client object. Sockets, buffers, state, commands, and stats all live on the facade. That makes it hard to reason about lifecycle, concurrency, errors, and testability.

Recommended target architecture:

```text
src/
  index.ts
  client/
    ZeroFTP.ts
    RemoteFileClient.ts
    ConnectionProfile.ts
  protocols/
    ftp/
      FtpAdapter.ts
      FtpControlConnection.ts
      FtpDataConnection.ts
      FtpCommandQueue.ts
      FtpResponseParser.ts
      FtpFeatureParser.ts
      FtpListParser.ts
    ftps/
      FtpsAdapter.ts
    sftp/
      SftpAdapter.ts
  services/
    TransferService.ts
    DirectoryService.ts
    MetadataService.ts
    SyncService.ts
    RetryPolicy.ts
  streams/
    ProgressTransform.ts
    ByteCounter.ts
  errors/
    ZeroFTPError.ts
    errorFactory.ts
  logging/
    Logger.ts
    redaction.ts
  types/
    public.ts
    internal.ts
  utils/
    path.ts
    time.ts
    byteSize.ts
    deferred.ts
    abort.ts
test/
  unit/
  integration/
  fixtures/
  servers/
```

Core design principles:

- The public client should be a facade, not the protocol implementation.
- FTP, FTPS, and SFTP should implement a shared `RemoteFileAdapter` interface.
- Protocol-specific details should be isolated behind adapters.
- FTP command execution should be serialized through a command queue.
- Data transfers should be represented as explicit transfer jobs with lifecycle state.
- Parsers should be pure functions/classes with fixture-heavy tests.
- Logging and metrics should be injected, not hard-coded to console.
- Errors should be first-class objects with consistent fields.

Potential core interfaces:

```ts
export interface RemoteFileClient {
  connect(options?: ConnectOptions): Promise<void>;
  disconnect(options?: DisconnectOptions): Promise<void>;
  list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
  stat(path: string, options?: StatOptions): Promise<RemoteStat>;
  exists(path: string, options?: ExistsOptions): Promise<boolean>;
  downloadFile(
    remotePath: string,
    localPath: string,
    options?: DownloadOptions,
  ): Promise<TransferResult>;
  uploadFile(
    localPath: string,
    remotePath: string,
    options?: UploadOptions,
  ): Promise<TransferResult>;
  downloadStream(remotePath: string, options?: DownloadOptions): Promise<NodeJS.ReadableStream>;
  uploadStream(
    stream: NodeJS.ReadableStream,
    remotePath: string,
    options?: UploadOptions,
  ): Promise<TransferResult>;
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  remove(path: string, options?: RemoveOptions): Promise<void>;
  rename(sourcePath: string, targetPath: string, options?: RenameOptions): Promise<void>;
}
```

### 4.4 FTP Protocol Correctness

High-risk current issues:

- The control-channel parser does not fully handle multi-line FTP replies.
- Multiple command listeners can observe the same response line.
- Transfers write `STOR`, `RETR`, and `LIST` directly to the socket instead of going through a command lifecycle.
- Transfers resolve when the data socket closes, not when the server returns final `226` or an equivalent completion status.
- Failed transfers can appear successful if the data socket closes before the control response is checked.
- The code uses a fixed `setTimeout(..., 10)` as a synchronization hack.
- `allowPreliminary` has timeout/lifecycle risks and is not used by the transfer commands.
- No `TYPE I` binary mode is set before binary transfers, which can corrupt binary data on some servers.
- Only `PASV` is supported. No `EPSV`, IPv6-aware behavior, active mode, or NAT fallback.
- No `FEAT` capability discovery.
- No `MLSD`/`MLST`, which are more reliable than `LIST` for structured metadata.
- No encoding handling for non-UTF-8 server listings.

Required FTP fixes:

- Implement a real `FtpResponseParser` that supports single-line and multi-line replies.
- Add a serialized `FtpCommandQueue` so exactly one command owns each response lifecycle.
- Model FTP data transfers as `preliminary response -> data stream -> final completion response`.
- Default to `TYPE I` for binary-safe transfers.
- Support `EPSV` first, then `PASV` fallback for IPv4 servers.
- Add optional passive host override or NAT strategy for bad PASV addresses.
- Use `FEAT` to detect `MLST`, `MLSD`, `UTF8`, `MDTM`, `SIZE`, `REST`, `HASH`, `MFMT`, and other extensions.
- Use `MLST` for `stat()` where available.
- Use `MLSD` for `list()` where available.
- Keep `LIST` as a fallback with robust parsers for Unix, Windows/DOS, symlink, and unusual spacing formats.
- Never rely on arbitrary delays for protocol correctness.

### 4.5 SFTP And FTPS Support

FTPS:

- Build on Node's `tls` module.
- Support explicit FTPS (`AUTH TLS`) and implicit FTPS.
- Support `PBSZ 0` and `PROT P` for protected data connections.
- Expose TLS options such as CA, cert, key, servername, rejectUnauthorized, and min TLS version.
- Default to secure certificate verification.

SFTP:

- Do not hand-roll SSH/SFTP. Use `ssh2` or a similarly mature protocol implementation under a thin adapter.
- Support password, private key, agent, passphrase, keyboard-interactive where reasonable.
- Support host key verification by default or provide a clear secure setup path.
- Map SFTP status codes into ZeroFTP error classes.
- Normalize SFTP stats into the same `RemoteStat` shape used by FTP/FTPS.

Dependency stance:

- Zero runtime dependencies is attractive for FTP-only, but SFTP is not realistic to implement safely from scratch.
- Consider `ssh2` as a runtime dependency or optional peer dependency for SFTP.
- If optional, fail with a clear setup error when users request `protocol: "sftp"` without the dependency installed.

### 4.6 Metadata, Listing, And Stat Accuracy

Current issues:

- `stat()` first tries `SIZE`, then `CWD`, then parent `LIST` substring search.
- Directory checks mutate the current working directory.
- Parent `LIST` matching can return false positives when names are substrings of other names.
- `listDetailed()` uses one Unix-like regex and returns raw `date` strings.
- No stable modified time, created time, access time, permissions, owner/group, symlink target, unique id, or raw facts shape.
- File size is not consistently represented as verified bytes from server facts.

Target metadata shape:

```ts
export interface RemoteEntry {
  path: string;
  name: string;
  type: "file" | "directory" | "symlink" | "unknown";
  size?: number;
  modifiedAt?: Date;
  createdAt?: Date;
  accessedAt?: Date;
  permissions?: RemotePermissions;
  owner?: string;
  group?: string;
  symlinkTarget?: string;
  uniqueId?: string;
  raw?: unknown;
}

export interface RemoteStat extends RemoteEntry {
  exists: true;
}
```

Recommended behavior:

- Prefer `MLST`/`MLSD` for FTP/FTPS metadata.
- Fall back to `SIZE`, `MDTM`, and robust `LIST` parsing.
- Use SFTP native stat/lstat/readdir for SFTP.
- Return `PathNotFoundError` for missing paths unless `exists()` is explicitly called.
- Make time zone handling explicit for legacy `LIST` fallback parsing.
- Add exact filename matching and path normalization helpers.

### 4.7 Transfer Performance And Reliability

Current issues:

- `uploadFile()` uses `fs.readFileSync()`, so large files are fully loaded into memory.
- `download()` buffers the full remote file into memory.
- `downloadStream()` writes without respecting backpressure.
- No upload stream API.
- No resume support.
- No transfer retries.
- No checksum or size verification.
- No atomic upload option.
- No local parent-directory creation for downloads.
- Global `client.dataSocket` makes concurrency unsafe.

Required transfer design:

- Use Node streams and `stream.pipeline()`.
- Respect backpressure everywhere.
- Add `uploadStream()` and `createWriteStream()` style APIs.
- Add `downloadStream()` and `createReadStream()` style APIs.
- Add `downloadFile()` and `uploadFile()` as stream wrappers, not buffer wrappers.
- Support `AbortSignal` and cleanup partial transfers.
- Support progress events with bytes transferred, total bytes if known, rate, elapsed time, and transfer id.
- Support resume download/upload where protocol supports it.
- Support atomic upload via temp remote path plus rename.
- Support optional verification by size, modified time, and checksum where available.
- Support retry policies with retryable error classification.
- Keep FTP commands serialized per connection, but optionally support a connection pool for parallel transfers.

Potential transfer result:

```ts
export interface TransferResult {
  sourcePath?: string;
  destinationPath: string;
  bytesTransferred: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  averageBytesPerSecond: number;
  resumed: boolean;
  verified: boolean;
  checksum?: string;
}
```

### 4.8 Error Handling

Current issues:

- Uses plain `Error` objects.
- Errors often lose FTP status code, command, path, host, and retryability context.
- Callers must inspect string messages such as `FTP Error 550`.
- No distinction between authentication, permission, missing path, timeout, parse, protocol, TLS, SFTP, filesystem, or aborted-operation errors.

Target error hierarchy:

- `ZeroFTPError`
- `ConnectionError`
- `AuthenticationError`
- `AuthorizationError`
- `PathNotFoundError`
- `PathAlreadyExistsError`
- `PermissionDeniedError`
- `TimeoutError`
- `AbortError`
- `ProtocolError`
- `ParseError`
- `TransferError`
- `VerificationError`
- `UnsupportedFeatureError`
- `ConfigurationError`

Required error fields:

```ts
interface ZeroFTPErrorDetails {
  code: string;
  message: string;
  cause?: unknown;
  protocol?: "ftp" | "ftps" | "sftp";
  host?: string;
  command?: string;
  ftpCode?: number;
  sftpCode?: number;
  path?: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}
```

Mapping examples:

- FTP 530 -> `AuthenticationError`
- FTP 550 on stat/delete/read -> `PathNotFoundError` or `PermissionDeniedError` depending on operation and message.
- FTP 421 -> retryable `ConnectionError`
- Socket timeout -> retryable or non-retryable `TimeoutError` depending on idempotency.
- SFTP `NO_SUCH_FILE` -> `PathNotFoundError`
- SFTP `PERMISSION_DENIED` -> `PermissionDeniedError`

### 4.9 Logging, Debugging, And Observability

Current issues:

- Debug logging is a boolean plus logger function.
- Logs are string-oriented and not structured.
- Password masking only covers commands beginning with `PASS `.
- No correlation ids, no transfer ids, no log levels, no metrics.

Target behavior:

- Accept a pino/winston/console-compatible logger.
- Provide a small built-in no-op logger by default.
- Emit structured logs with level, component, protocol, host, connection id, command id, transfer id, path, duration, bytes, and result.
- Redact password, private key, passphrase, token, username when configured, and any command payload known to contain secrets.
- Support namespaces such as `zero-ftp:connection`, `zero-ftp:control`, `zero-ftp:data`, `zero-ftp:transfer`, `zero-ftp:retry`.
- Provide optional event emission for UI clients.
- Provide debug snapshots that do not expose secrets.

Useful events:

- `connect:start`
- `connect:success`
- `connect:error`
- `command:start`
- `command:response`
- `command:error`
- `transfer:start`
- `transfer:progress`
- `transfer:retry`
- `transfer:complete`
- `transfer:error`
- `disconnect`

### 4.10 Security

Current issues:

- No TLS or SSH support.
- FTP credentials and paths are interpolated into raw commands.
- No command-injection guard against CRLF in paths or command arguments.
- No host key verification because SFTP does not exist yet.
- No TLS certificate verification options because FTPS does not exist yet.
- No documented safe logging/redaction policy.
- No handling for unsafe local file writes in recursive downloads.

Target security requirements:

- Reject FTP command arguments containing CR or LF unless explicitly using a raw advanced API.
- Redact secrets in logs, events, errors, and debug state.
- Default FTPS to certificate verification.
- Default SFTP to explicit host key verification guidance.
- Support key-based auth for SFTP.
- Support secure TLS options with modern minimum versions.
- Add dependency scanning and CodeQL.
- Protect recursive downloads from local path traversal.
- Use temporary files for downloads when requested, then rename after success.
- Avoid leaving partial files unless `keepPartial` is explicitly enabled.
- Document threat model and security recommendations.

### 4.11 Testing And TDD

Current issues:

- `test-comprehensive.js` is a manual integration script with empty credentials.
- No assertions framework.
- No deterministic mock server.
- No fixture-based parser tests.
- No coverage measurement.
- No CI.

Testing target:

- Test-driven rebuild with 90%+ coverage across statements, branches, functions, and lines.
- Unit tests first for parsers, path utilities, errors, retry policy, and command queue.
- Fake server tests for FTP command lifecycle and edge cases.
- Docker integration tests for FTP, FTPS, and SFTP.
- Contract tests that assert the same high-level API behavior across protocols.
- Transfer tests for streams, backpressure, abort, resume, retries, atomic upload, and verification.
- Snapshot fixtures for weird directory listings.

Recommended tooling:

- `typescript`
- `vitest` or Node's built-in test runner plus coverage tooling
- `@types/node`
- `eslint`
- `prettier`
- `tsup` or `rollup` for builds
- `typedoc` for API documentation
- Docker Compose for integration servers
- `c8`/V8 coverage if not using Vitest coverage directly

Coverage gates:

```text
statements: 90
branches: 90
functions: 90
lines: 90
```

High-value test fixtures:

- Single-line FTP replies.
- Multi-line FTP replies.
- Preliminary plus final transfer replies.
- Failed `RETR` after data connection setup.
- `PASV` with private/NAT host.
- `EPSV` success and fallback to `PASV`.
- Unix `LIST` lines with spaces in filenames.
- Symlink listings.
- DOS/Windows listings.
- `MLSD` facts with size, modify, type, perm, unique.
- `MDTM` UTC parsing.
- SFTP stat mapping.
- Abort during upload and download.
- Backpressure during download stream.
- Retry on dropped data socket.
- Command injection rejection for CRLF paths.

### 4.12 GitHub Workflows And Release Engineering

Needed workflows:

- CI on push and pull request.
- Release workflow for npmjs only.
- CodeQL/security workflow.
- Dependency update workflow through Dependabot or Renovate.
- Optional nightly integration matrix against real server containers.

Recommended CI checks:

- Install with `npm ci`.
- Lint.
- Format check.
- Type check.
- Unit tests.
- Integration tests where containers are available.
- Coverage threshold.
- Build.
- Package dry run.
- Verify generated types.

Recommended release path:

- Use Changesets or semantic-release.
- Generate changelog from changesets/conventional commits.
- Publish to npmjs with provenance.
- Use GitHub Actions OIDC trusted publishing instead of long-lived npm tokens where possible.
- Remove GitHub Packages support.
- Add `npm publish --dry-run` as a pre-release gate.

Example workflow targets:

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`

### 4.13 Documentation

Needed docs:

- New README for `zero-ftp`.
- Installation and quick start for FTP, FTPS, and SFTP.
- API reference generated from TypeScript/JSDoc.
- Error-handling guide.
- Logging/debugging guide.
- Security guide.
- Retry/resume guide.
- Migration guide from `molex-ftp`.
- Examples for full client-building workflows.

Example docs/examples:

- `examples/basic-ftp.ts`
- `examples/ftps-explicit.ts`
- `examples/sftp-private-key.ts`
- `examples/progress-events.ts`
- `examples/recursive-sync.ts`
- `examples/resume-download.ts`
- `examples/build-file-browser.ts`
- `examples/structured-logging.ts`

## 5. Proposed Feature Set

### MVP For First ZeroFTP Alpha

- TypeScript rewrite.
- FTP adapter with correct command queue and transfer lifecycle.
- FTPS explicit support if TLS architecture is ready.
- Stable error classes.
- Structured logger injection and secret redaction.
- `connect`, `disconnect`, `list`, `stat`, `exists`, `mkdir`, `ensureDir`, `removeFile`, `removeDir`, `rename`.
- `uploadFile`, `uploadStream`, `downloadFile`, `downloadStream`, `download`.
- Progress events/callbacks.
- AbortSignal support.
- `MLSD`/`MLST` support with `LIST` fallback.
- Unit tests and fake-server tests with 90%+ coverage for implemented code.
- CI, typecheck, lint, build, coverage.

### Beta Feature Set

- SFTP adapter using `ssh2`.
- FTPS implicit support.
- Resume download/upload.
- Retry policies.
- Atomic upload.
- Recursive upload/download.
- `walk` and `glob`.
- Transfer verification by size and optional checksum.
- Connection profiles.
- More integration server coverage.

### 1.0 Feature Set

- Stable public API.
- Full FTP/FTPS/SFTP parity for common operations.
- Sync/mirror workflows.
- Connection pooling for parallel transfers.
- Typed event emitter support.
- Typedoc API site.
- Security guide and migration guide.
- Release automation with npm provenance.

### Longer-Term Differentiators

- Dry-run sync planning with detailed diff output.
- Bandwidth throttling.
- Transfer queue with pause/resume/cancel.
- Local cache/index for huge remote trees.
- Pluggable credential providers.
- Browser-style file browser helper models.
- Checksum adapters for server-specific FTP extensions.
- OpenTelemetry spans/metrics integration.
- WebDAV or cloud-storage adapters only if the project intentionally expands beyond FTP/SFTP.

## 6. Proposed Phased Rebuild

### Phase 0: Rename And Project Baseline

- Rename package to `zero-ftp`.
- Update README badges, install command, imports, repository URLs, bug URL, homepage.
- Remove GitHub Packages assumptions and keep npmjs publish config only.
- Decide Node support floor.
- Add TypeScript build pipeline.
- Add lint/format/typecheck/test scripts.
- Add package `exports`, `types`, `files`, and npm provenance config.
- Keep old code untouched until tests are ready, or move it under `legacy/` if useful for reference.

### Phase 1: Test Harness Before Core Rewrite

- Add test framework and coverage gates.
- Add parser fixture tests.
- Add fake FTP server harness for deterministic protocol tests.
- Convert current `test-comprehensive.js` into a real integration test or example.
- Add Docker Compose integration servers for FTP, FTPS, and SFTP.
- Add CI running unit tests on every push/PR.

### Phase 2: FTP Core Correctness

- Build `FtpResponseParser`.
- Build `FtpCommandQueue`.
- Build `FtpControlConnection`.
- Build `FtpDataConnection`.
- Implement `FEAT`, `TYPE I`, `EPSV`, `PASV`, `PWD`, `CWD`, `NOOP`, `QUIT`.
- Implement transfer lifecycle with preliminary/final response handling.
- Add abort and timeout handling.
- Add structured errors.

### Phase 3: Metadata And Filesystem Operations

- Implement `MLST`/`MLSD` parser.
- Implement robust `LIST` fallback parser.
- Implement `stat`, `exists`, `list`, `walk`, `mkdir`, `ensureDir`, `removeFile`, `removeDir`, `rename`.
- Avoid mutating working directory for path checks.
- Add exact metadata tests.

### Phase 4: Transfer Service

- Implement stream-based upload/download.
- Add file wrappers using `pipeline()`.
- Add progress reporting.
- Add atomic upload.
- Add local parent-directory handling.
- Add transfer verification.
- Add resume support where FTP server supports `REST`.
- Add retry policy and retryable error classification.

### Phase 5: FTPS And SFTP Adapters

- Add explicit FTPS.
- Add implicit FTPS.
- Add protected data connections.
- Add TLS configuration tests.
- Add SFTP adapter with `ssh2`.
- Normalize SFTP errors and metadata.
- Add protocol contract tests across FTP, FTPS, and SFTP.

### Phase 6: QOL Workflows And 1.0 Polish

- Add recursive upload/download.
- Add sync/mirror planning and execution.
- Add transfer queue and optional connection pooling.
- Add examples and migration docs.
- Add CodeQL, Dependabot/Renovate, release workflow.
- Publish alpha/beta versions before 1.0.

## 7. Suggested Public API Names

Prefer:

- `ZeroFTP`
- `ZeroFTP.connect()` static helper
- `createClient()` factory for users who prefer functions
- `disconnect()` over `close()` as the primary public name, while `close()` can be an alias
- `removeFile()` and `removeDir()` over `delete()`
- `uploadFile()` for local path to remote path
- `uploadStream()` for stream to remote path
- `upload()` for Buffer/string payloads only
- `downloadFile()` for remote path to local path
- `downloadStream()` for remote path to writable stream or returning readable stream, but avoid ambiguous overloads
- `stat()` for metadata or throw if missing
- `exists()` for boolean existence checks
- `list()` for structured entries, not raw listing strings
- `rawList()` for raw protocol listing if needed
- `execute()` or `raw.ftpCommand()` for raw FTP commands

Avoid:

- Bare booleans such as `upload(data, path, true)`.
- Mutating current directories inside metadata helpers.
- Stringly typed error handling.
- Public methods that expose FTP-only assumptions when the API is meant to also support SFTP.

## 8. Concrete Bug And Risk Backlog From Current Code

Priority 0:

- Data transfers do not wait for final server completion responses.
- Binary transfers may be unsafe because `TYPE I` is not enforced.
- Control response handling is not robust enough for multi-line replies.
- `uploadFile()` buffers whole files into memory.
- `downloadStream()` ignores backpressure.
- Paths are interpolated into FTP commands without CRLF rejection.

Priority 1:

- `stat()` can return false positives and mutates remote cwd.
- `listDetailed()` is not reliable across server formats.
- `ensureDir()` guesses file paths by extension, which fails for extensionless files and dotted directories.
- No operation-level abort support.
- No structured errors.
- No automated tests.

Priority 2:

- No FTPS/SFTP.
- No retries/resume/verification.
- No CI/release automation.
- No TypeScript support.
- No package export map.
- No docs beyond README.

## 9. Definition Of Done For ZeroFTP 1.0

- Package publishes as `zero-ftp` to npmjs only.
- TypeScript source with generated declarations.
- ESM and CJS consumers both work.
- FTP, FTPS, and SFTP adapters pass shared contract tests.
- 90%+ coverage gates pass in CI.
- All high-risk FTP protocol bugs listed above are fixed by design.
- Stream transfers respect backpressure.
- All network operations accept AbortSignal and timeout options.
- Errors are typed, documented, and include actionable context.
- Logs are structured and redact secrets by default.
- Metadata from `stat()` and `list()` is accurate and normalized.
- Release workflow publishes to npmjs with provenance.
- README, examples, API docs, migration guide, and security guide exist.

## 10. Immediate Next Steps

1. Create a rename/setup branch for `zero-ftp`.
2. Update package metadata and README branding.
3. Add TypeScript, build, lint, test, and coverage tooling.
4. Add CI workflow before rewriting behavior.
5. Write parser and command-queue tests first.
6. Build the FTP core around a real command queue and transfer lifecycle.
7. Port high-level methods only after the core behavior is tested.
8. Add FTPS and SFTP adapters once the shared adapter contract is stable.
9. Publish `0.1.0-alpha.0` to npmjs for early testing.
