<p align="center">
  <img src="assets/zero-transfer-logo.svg" alt="ZeroTransfer SDK" width="720">
</p>

# ZeroTransfer

[![npm version](https://img.shields.io/npm/v/@zero-transfer/sdk.svg)](https://www.npmjs.com/package/@zero-transfer/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@zero-transfer/sdk.svg)](https://www.npmjs.com/package/@zero-transfer/sdk)
[![CI](https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml/badge.svg)](https://github.com/tonywied17/zero-transfer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

ZeroTransfer is a TypeScript-first Node.js SDK for moving files across classic protocols, web transfer endpoints, object storage, cloud drives, and future MFT-style workflows. The project is being rebuilt from the original `molex-ftp` implementation into a safer, typed, observable transfer platform with parser-first tests, npmjs-only publishing, and generated API documentation in mind.

## Status

This repository is in the ZeroTransfer alpha foundation phase. The old CommonJS package surface has been removed so the project can move forward around the TypeScript `src/` foundation and generated `dist/` output.

The current foundation includes:

- TypeScript source, declarations, and dual ESM/CJS package output.
- Vitest coverage gates at 90% across statements, branches, functions, and lines.
- ESLint, Prettier, typecheck, build, package dry-run, and CI scripts.
- Typed error classes, safe remote argument validation, structured logging redaction helpers, and FTP parser tests.
- Provider-neutral core contracts, provider registry, `TransferClient`, `createTransferClient()`, provider capability discovery, deterministic memory and local providers, profile secret utilities, and initial transfer engine primitives.
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

`ZeroTransfer` is the preferred facade for new code. `ZeroFTP` remains exported as a temporary compatibility alias while the provider-neutral API takes shape.

The first provider-neutral core path is also available for provider registration and capability discovery:

```ts
import { createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient();
const capabilities = client.getCapabilities();
```

Provider factories can be registered with `createTransferClient({ providers: [...] })`. Built-in network providers are intentionally not deep-implemented in this alpha slice yet.

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

The memory provider is intentionally narrow: it supports connection lifecycle, capability discovery, `fs.list()`, `fs.stat()`, and typed missing-path errors over in-memory fixture state.

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
});

const resolved = await resolveConnectionProfileSecrets(profile);
const safeForLogs = redactConnectionProfile(profile);
```

Protocol adapters are intentionally being added incrementally. Early releases focus on the package foundation, deterministic tests, parser correctness, typed errors, logging, and transfer-service primitives before the FTP/FTPS/SFTP implementations are ported and broader provider families are added.

The first transfer-engine foundation is available for adapters and higher-level workflows that need abort-aware execution, progress callbacks, retry hooks, and audit receipts around a concrete transfer operation:

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
    return { bytesTransferred: 1024, verified: true };
  },
  { retry: { maxAttempts: 2 } },
);
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

## Publishing

ZeroTransfer publishes only to the public npm registry as `@zero-transfer/sdk`.

The `zero-transfer` npm organization owns the package scope. The first package is the batteries-included SDK at `@zero-transfer/sdk`; future monorepo packages can split provider-neutral contracts into `@zero-transfer/core` and adapters such as `@zero-transfer/ftp`, `@zero-transfer/sftp`, and `@zero-transfer/s3` when the contracts prove out.

Publishing is configured for npm provenance through GitHub Actions. For token-based test publishing, add the npm automation token as a repository secret named `NPM_TOKEN`; never commit npm tokens or place them in local config files. There is no GitHub Packages release target.

## License

MIT License
