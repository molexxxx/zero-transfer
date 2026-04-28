// @ts-check
/**
 * Generates the packages/* workspace stubs for the future @zero-transfer
 * monorepo shape. Each stub re-exports from @zero-transfer/sdk so that
 * consumers can install any scoped name and receive the batteries-included
 * SDK today; future phases narrow each package to its own provider surface.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

/** @type {{ name: string; description: string; keywords: string[] }[]} */
const stubs = [
  {
    description: "Core ZeroTransfer contracts (TransferClient, providers, profiles, errors).",
    keywords: ["transfer", "core", "sdk"],
    name: "core",
  },
  {
    description: "Classic transfer providers (FTP, FTPS, SFTP) for ZeroTransfer.",
    keywords: ["ftp", "ftps", "sftp", "classic"],
    name: "classic",
  },
  {
    description: "FTP provider for ZeroTransfer.",
    keywords: ["ftp"],
    name: "ftp",
  },
  {
    description: "FTPS (explicit + implicit TLS) provider for ZeroTransfer.",
    keywords: ["ftps", "ftp", "tls"],
    name: "ftps",
  },
  {
    description: "SFTP provider with jump-host support for ZeroTransfer.",
    keywords: ["sftp", "ssh"],
    name: "sftp",
  },
  {
    description: "HTTP(S) provider with signed URL support for ZeroTransfer.",
    keywords: ["http", "https", "signed-url"],
    name: "http",
  },
  {
    description: "WebDAV provider for ZeroTransfer.",
    keywords: ["webdav"],
    name: "webdav",
  },
  {
    description: "S3-compatible object storage provider with multipart resume for ZeroTransfer.",
    keywords: ["s3", "object-storage", "multipart"],
    name: "s3",
  },
  {
    description: "Google Drive provider for ZeroTransfer.",
    keywords: ["google-drive", "google", "drive"],
    name: "google-drive",
  },
  {
    description: "Dropbox provider for ZeroTransfer.",
    keywords: ["dropbox"],
    name: "dropbox",
  },
  {
    description: "Azure Blob Storage provider for ZeroTransfer.",
    keywords: ["azure", "azure-blob", "blob"],
    name: "azure-blob",
  },
  {
    description:
      "Managed File Transfer (MFT) workflows — routes, schedules, audit logs, webhooks, approvals.",
    keywords: ["mft", "managed-file-transfer", "routes", "schedules"],
    name: "mft",
  },
];

const sdkVersion = JSON.parse(
  // eslint-disable-next-line n/no-sync
  (await import("node:fs")).readFileSync(join(repoRoot, "package.json"), "utf8"),
).version;

const banner = "// AUTO-GENERATED stub. See packages/README.md.\n";

for (const stub of stubs) {
  const dir = join(repoRoot, "packages", stub.name);
  const distDir = join(dir, "dist");
  mkdirSync(distDir, { recursive: true });

  const pkg = {
    name: `@zero-transfer/${stub.name}`,
    version: sdkVersion,
    description: stub.description,
    keywords: ["zero-transfer", ...stub.keywords],
    author: "Tony Wiedman",
    license: "MIT",
    main: "./dist/index.cjs",
    module: "./dist/index.mjs",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.mjs",
        require: "./dist/index.cjs",
      },
      "./package.json": "./package.json",
    },
    files: ["dist", "README.md", "LICENSE"],
    repository: {
      type: "git",
      url: "git+https://github.com/tonywied17/zero-transfer.git",
      directory: `packages/${stub.name}`,
    },
    bugs: { url: "https://github.com/tonywied17/zero-transfer/issues" },
    homepage: "https://github.com/tonywied17/zero-transfer#readme",
    engines: { node: ">=20.0.0" },
    publishConfig: {
      registry: "https://registry.npmjs.org/",
      provenance: true,
      access: "public",
    },
    sideEffects: false,
    dependencies: {
      "@zero-transfer/sdk": sdkVersion,
    },
  };
  writeFileSync(join(dir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

  writeFileSync(join(distDir, "index.mjs"), `${banner}export * from "@zero-transfer/sdk";\n`);
  writeFileSync(
    join(distDir, "index.cjs"),
    `${banner}"use strict";\nmodule.exports = require("@zero-transfer/sdk");\n`,
  );
  writeFileSync(join(distDir, "index.d.ts"), `${banner}export * from "@zero-transfer/sdk";\n`);

  const readme = `# @zero-transfer/${stub.name}

${stub.description}

> **Alpha umbrella package.** This package currently re-exports the entire
> [\`@zero-transfer/sdk\`](https://www.npmjs.com/package/@zero-transfer/sdk)
> public surface. Future releases will narrow this package to only its
> dedicated subset (see the
> [ZeroTransfer remake plan](https://github.com/tonywied17/zero-transfer/blob/main/zero-transfer-remake.md#future-monorepo-shape)).
> If you want every provider in one install today, depend on
> \`@zero-transfer/sdk\` directly.

## Install

\`\`\`bash
npm install @zero-transfer/${stub.name}
\`\`\`

## Usage

\`\`\`ts
import { createTransferClient } from "@zero-transfer/${stub.name}";

const client = createTransferClient();
\`\`\`

See the [main README](https://github.com/tonywied17/zero-transfer#readme) for
full documentation.

## License

MIT © Tony Wiedman
`;
  writeFileSync(join(dir, "README.md"), readme);
}

console.log(`Generated ${stubs.length} package stubs at version ${sdkVersion}.`);
