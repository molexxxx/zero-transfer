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
  protocol: "ftps",
  host: "ftp.example.com",
  username: "deploy",
  password: process.env.FTP_PASSWORD,
  secure: true,
});

const entries = await client.list("/releases");
const artifact = await client.stat("/releases/app.zip");
await client.disconnect();
```

`ZeroTransfer` is the preferred facade for new code. `ZeroFTP` remains exported as a temporary compatibility alias while the provider-neutral API takes shape.

Protocol adapters are intentionally being added incrementally. Early releases focus on the package foundation, deterministic tests, parser correctness, typed errors, logging, and transfer-service primitives before the FTP/FTPS/SFTP implementations are ported and broader provider families are added.

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
