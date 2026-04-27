<p align="center">
  <img src="assets/zero-ftp-logo.svg" alt="ZeroTransfer SDK" width="720">
</p>

# ZeroFTP

[![npm version](https://img.shields.io/npm/v/zero-ftp.svg)](https://www.npmjs.com/package/zero-ftp)
[![npm downloads](https://img.shields.io/npm/dm/zero-ftp.svg)](https://www.npmjs.com/package/zero-ftp)
[![CI](https://github.com/tonywied17/zero-ftp/actions/workflows/ci.yml/badge.svg)](https://github.com/tonywied17/zero-ftp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

ZeroFTP is a TypeScript-first Node.js SDK for FTP, FTPS, and SFTP clients. The project is being rebuilt from the original `molex-ftp` implementation into a safer, typed, observable file-transfer library with parser-first tests, npmjs-only publishing, and generated API documentation in mind.

## Status

This repository is in the ZeroFTP remake phase. The old CommonJS package surface has been removed so the project can move forward around the TypeScript `src/` foundation and generated `dist/` output.

The current foundation includes:

- TypeScript source, declarations, and dual ESM/CJS package output.
- Vitest coverage gates at 90% across statements, branches, functions, and lines.
- ESLint, Prettier, typecheck, build, package dry-run, and CI scripts.
- Typed error classes, safe FTP argument validation, structured logging redaction helpers, and FTP parser tests.
- Verbose JSDoc across the public TypeScript API for future generated documentation.
- Initial GitHub Actions scaffolding for CI, CodeQL, and npmjs release provenance.

## Installation

```bash
npm install zero-ftp
```

## Intended API Direction

```ts
import { ZeroFTP } from "zero-ftp";

const client = await ZeroFTP.connect({
  protocol: "ftps",
  host: "ftp.example.com",
  username: "deploy",
  password: process.env.FTP_PASSWORD,
  secure: true,
});

const entries = await client.list("/releases");
await client.downloadFile("/releases/app.zip", "./app.zip");
await client.disconnect();
```

Protocol adapters are intentionally being added incrementally. Early releases focus on the package foundation, deterministic tests, parser correctness, typed errors, logging, and transfer-service primitives before the FTP/FTPS/SFTP implementations are ported.

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

ZeroFTP publishes only to the public npm registry as `zero-ftp`.

Publishing is configured for npm provenance through GitHub Actions trusted publishing. There is no GitHub Packages release target.

## License

MIT License
