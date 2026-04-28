<p align="center">
  <img src="assets/zero-transfer-logo.svg" alt="ZeroTransfer file transfer SDK for Node.js" width="720">
</p>

# ZeroTransfer

[![npm version](https://img.shields.io/npm/v/@zero-transfer/sdk.svg)](https://www.npmjs.com/package/@zero-transfer/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@zero-transfer/sdk.svg)](https://www.npmjs.com/package/@zero-transfer/sdk)
[![CI](https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml/badge.svg)](https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

ZeroTransfer is a unified TypeScript-first Node.js SDK for moving files across classic protocols, web transfer endpoints, object storage, cloud drives, and future MFT-style workflows. The project is being rebuilt from the original FTP-first implementation into a safer, typed, observable transfer platform with parser-first tests, npmjs-only publishing, and generated API documentation in mind.

## Status

This repository is in the ZeroTransfer alpha foundation phase. The old CommonJS package surface has been removed so the project can move forward around the TypeScript `src/` foundation and generated `dist/` output.

The current foundation includes:

- TypeScript source, declarations, and dual ESM/CJS package output.
- Vitest coverage gates at 90% across statements, branches, functions, and lines.
- ESLint, Prettier, typecheck, build, package dry-run, and CI scripts.
- Typed error classes, safe remote argument validation, structured logging redaction helpers, FTP parser tests, and an initial classic FTP provider contract slice.
- Provider-neutral core contracts, provider registry, `TransferClient`, `createTransferClient()`, provider capability discovery, deterministic memory and local providers with read/write transfer operations, an MLST/MLSD/EPSV/PASV-based FTP provider with streaming read/write transfer operations, profile secret utilities, transfer plans, transfer queue primitives, and the initial transfer engine.
- Verbose JSDoc across the public TypeScript API for future generated documentation.
- Initial GitHub Actions scaffolding for CI, CodeQL, and npmjs release provenance.

## Installation

```bash
npm install @zero-transfer/sdk
```

## Intended API Direction

```ts
import { ZeroTransfer } from "@zero-transfer/sdk";

const client = await ZeroTransfer.connect({
  provider: "ftps",
  host: "ftp.example.com",
  username: "deploy",
  password: { env: "FTP_PASSWORD" },
  secure: true,
});

const entries = await client.list("/releases");
const artifact = await client.stat("/releases/app.zip");
await client.disconnect();
```

`ZeroTransfer` is the facade for new provider-neutral code. Protocol-specific behavior lives behind providers and adapters rather than a protocol-named client class.

The first provider-neutral core path is also available for provider registration and capability discovery:

```ts
import { createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient();
const capabilities = client.getCapabilities();
```

Provider factories can be registered with `createTransferClient({ providers: [...] })`. Classic network providers are being added incrementally; the FTP provider supports login, `fs.stat()` through MLST, `fs.list()` through EPSV/PASV MLSD, streaming provider transfer reads/writes through EPSV/PASV `RETR`/`STOR` with REST offsets, and profile `timeoutMs` enforcement across control replies and passive transfers. The first FTPS slice supports explicit `AUTH TLS`, `PBSZ 0`, encrypted `PROT P` data channels, and TLS profile fields for CA bundles, client certificates, keys, PFX/P12 bundles, passphrases, SNI, TLS versions, and certificate validation controls. The SFTP provider supports password, private-key, agent, and keyboard-interactive authentication, SSH transport algorithm overrides, custom socket factories for proxy and tunnel integrations, provider transfer streams, and profile-level host-key verification with known_hosts content or pinned SHA-256 host-key fingerprints.

```ts
import { createFtpProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createFtpProviderFactory()],
});

const session = await client.connect({
  provider: "ftp",
  host: "ftp.example.com",
  username: { env: "FTP_USERNAME" },
  password: { env: "FTP_PASSWORD" },
});

const releases = await session.fs.list("/releases");
const artifact = await session.fs.stat("/releases/app.zip");
await session.disconnect();
```

Explicit FTPS can use the same provider-neutral session API with TLS settings on the connection profile:

```ts
import { createFtpsProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createFtpsProviderFactory()],
});

const session = await client.connect({
  provider: "ftps",
  host: "ftp.example.com",
  username: { env: "FTP_USERNAME" },
  password: { env: "FTP_PASSWORD" },
  tls: {
    ca: { path: "./certs/private-ca.pem" },
    servername: "ftp.example.com",
  },
});

const releases = await session.fs.list("/releases");
await session.disconnect();
```

For deterministic contract and unit tests, the SDK exports a fixture-backed memory provider factory:

```ts
import { createMemoryProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [
    createMemoryProviderFactory({
      entries: [{ path: "/fixtures/report.csv", type: "file", size: 24 }],
    }),
  ],
});

const session = await client.connect({ provider: "memory", host: "memory.local" });
const entries = await session.fs.list("/fixtures");
const report = await session.fs.stat("/fixtures/report.csv");
await session.disconnect();
```

The memory provider is intentionally test-focused: it supports connection lifecycle, capability discovery, `fs.list()`, `fs.stat()`, typed missing-path errors, and deterministic in-memory transfer reads/writes over fixture state.

The local provider exposes a configured local root as `/` for local-only tests and early provider contract coverage:

```ts
import { createLocalProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createLocalProviderFactory({ rootPath: process.cwd() })],
});

const session = await client.connect({ provider: "local", host: "local" });
const files = await session.fs.list("/");
await session.disconnect();
```

The local provider also exposes provider transfer reads/writes under `session.transfers` for local-only workflow tests and early transfer-engine coverage.

Profile helpers are also available for validating connection profiles, resolving deferred secret sources, and redacting diagnostics:

```ts
import {
  redactConnectionProfile,
  resolveConnectionProfileSecrets,
  validateConnectionProfile,
} from "@zero-transfer/sdk";

const profile = validateConnectionProfile({
  provider: "sftp",
  host: "files.example.com",
  username: { env: "ZT_USER" },
  password: { env: "ZT_PASSWORD" },
  ssh: {
    knownHosts: { path: "./known_hosts" },
    pinnedHostKeySha256: "SHA256:base64-encoded-host-key-digest",
  },
});

const resolved = await resolveConnectionProfileSecrets(profile);
const safeForLogs = redactConnectionProfile(profile);
```

Protocol adapters are intentionally being added incrementally. Early releases focus on the package foundation, deterministic tests, parser correctness, typed errors, logging, provider contracts, and transfer-service primitives while FTP is hardened, FTPS/SFTP support is ported in focused slices, and broader provider families are added.

The first transfer-engine foundation is available for adapters and higher-level workflows that need abort-aware execution, progress callbacks, retry hooks, timeout policy, bandwidth-limit handoff, verification details, and audit receipts around a concrete transfer operation:

```ts
import { TransferEngine, type TransferJob } from "@zero-transfer/sdk";

const engine = new TransferEngine();
const job: TransferJob = {
  id: "upload-1",
  operation: "upload",
  source: { provider: "local", path: "./dist/app.zip" },
  destination: { provider: "memory", path: "/releases/app.zip" },
  totalBytes: 1024,
};

const receipt = await engine.execute(
  job,
  (context) => {
    context.reportProgress(1024);
    return {
      bytesTransferred: 1024,
      verification: { method: "checksum", verified: true },
    };
  },
  {
    bandwidthLimit: { bytesPerSecond: 1024 * 1024 },
    retry: { maxAttempts: 2 },
    timeout: { timeoutMs: 30_000 },
  },
);
```

Provider sessions that can stream content expose `session.transfers.read()` and `session.transfers.write()`. The memory, local, and initial FTP providers implement that surface now, and the SDK exports `createProviderTransferExecutor()` to bridge provider operations into `TransferEngine` without hard-coding a concrete FTP, SFTP, or cloud implementation:

```ts
import { createProviderTransferExecutor } from "@zero-transfer/sdk";

const executor = createProviderTransferExecutor({
  resolveSession: ({ endpoint }) => connectedSessions.get(endpoint.provider ?? ""),
});

const receipt = await engine.execute(job, executor, {
  retry: { maxAttempts: 2 },
});
```

Dry-run transfer plans can be converted into executable jobs and drained through a minimal queue with concurrency, pause/resume, cancellation, progress, retries, receipts, and per-job failure tracking:

```ts
import { TransferQueue, createTransferJobsFromPlan, createTransferPlan } from "@zero-transfer/sdk";

const plan = createTransferPlan({
  id: "release-plan",
  steps: [
    {
      id: "upload-app",
      action: "upload",
      source: { provider: "local", path: "./dist/app.zip" },
      destination: { provider: "memory", path: "/releases/app.zip" },
      expectedBytes: 1024,
    },
  ],
});

const queue = new TransferQueue({
  concurrency: 2,
  executor: (context) => {
    const bytesTransferred = context.job.totalBytes ?? 0;
    context.reportProgress(bytesTransferred);
    return { bytesTransferred, verified: true };
  },
});

for (const plannedJob of createTransferJobsFromPlan(plan)) {
  queue.add(plannedJob);
}

const summary = await queue.run();
```

## Development

```bash
npm install
npm run lint
npm run format:check
npm run typecheck
npm run test:coverage
npm run build
npm run pack:dry
```

Use `npm run ci` to run the same local quality gate used by the CI workflow.

Docker-backed FTP integration coverage is opt-in because it pulls and runs a real `pure-ftpd`
container. With Docker running locally, use:

```bash
npm run test:integration:ftp
```

The script starts the FTP service from `test/servers/docker-compose.yml`, runs the provider
metadata and transfer round-trip coverage, and tears the container down afterward.

## Publishing

ZeroTransfer publishes only to the public npm registry as `@zero-transfer/sdk`.

The `zero-transfer` npm organization owns the package scope. The first package is the batteries-included SDK at `@zero-transfer/sdk`; future monorepo packages can split provider-neutral contracts into `@zero-transfer/core` and adapters such as `@zero-transfer/ftp`, `@zero-transfer/sftp`, and `@zero-transfer/s3` when the contracts prove out.

Publishing is configured for npm provenance through GitHub Actions. For token-based test publishing, add the npm automation token as a repository secret named `NPM_TOKEN`; never commit npm tokens or place them in local config files. There is no GitHub Packages release target.

## License

MIT License
