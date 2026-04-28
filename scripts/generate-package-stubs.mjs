// @ts-check
/**
 * Generates the `packages/*` workspace folders for the @zero-transfer monorepo.
 *
 * Each package is a real, narrowly-scoped surface — NOT a blanket re-export of
 * `@zero-transfer/sdk`. The exact public surface for each package is defined
 * in `scripts/scope-manifest.mjs` (`scopes[].exports`).
 *
 * Generation pipeline:
 *   1. Build (or reuse) the root SDK in `./dist`.
 *   2. Introspect `dist/index.cjs` at runtime to learn which exported names are
 *      values vs. types-only (types-only names are not present on the CJS
 *      module object).
 *   3. For each scope, emit:
 *        - `package.json`               narrowed metadata + provenance config
 *        - `dist/index.mjs`             named ESM re-export of value names
 *        - `dist/index.cjs`             CJS module exporting only value names
 *        - `dist/index.d.ts`            named TS re-export (values + types)
 *
 * Run with: `npm run packages:generate`. Per-package READMEs are produced by
 * `npm run docs:scopes`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { scopes } from "./scope-manifest.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const require_ = createRequire(import.meta.url);

const sdkVersion = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).version;

const sdk = require_(join(repoRoot, "dist/index.cjs"));
const sdkValueNames = new Set(Object.keys(sdk));

const banner = "// AUTO-GENERATED. Edit scripts/scope-manifest.mjs and re-run packages:generate.\n";

let totalValues = 0;
let totalTypes = 0;
/** @type {{ scope: string; name: string }[]} */
const missing = [];

let cachedDts = "";
try {
  cachedDts = readFileSync(join(repoRoot, "dist/index.d.ts"), "utf8");
} catch {
  cachedDts = "";
}
/**
 * Cheap textual probe of `dist/index.d.ts` to verify a symbol is exported.
 * @param {string} name
 * @returns {boolean}
 */
function sdkDeclaresType(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(cachedDts);
}

for (const scope of scopes) {
  const dir = join(repoRoot, "packages", scope.name);
  const distDir = join(dir, "dist");
  mkdirSync(distDir, { recursive: true });

  const valueNames = scope.exports.filter((name) => sdkValueNames.has(name));
  const typeNames = scope.exports.filter((name) => !sdkValueNames.has(name));

  totalValues += valueNames.length;
  totalTypes += typeNames.length;

  if (scope.exports.length === 0) {
    throw new Error(`Scope "${scope.name}" has no exports listed in scope-manifest.mjs.`);
  }

  // package.json
  const pkg = {
    name: `@zero-transfer/${scope.name}`,
    version: sdkVersion,
    description: scope.summary,
    keywords: ["zero-transfer", scope.name, ...deriveKeywords(scope.name)],
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
      directory: `packages/${scope.name}`,
    },
    bugs: { url: "https://github.com/tonywied17/zero-transfer/issues" },
    homepage: `https://github.com/tonywied17/zero-transfer/tree/main/packages/${scope.name}#readme`,
    engines: { node: ">=20.0.0" },
    publishConfig: {
      registry: "https://registry.npmjs.org/",
      provenance: true,
      access: "public",
    },
    sideEffects: false,
    peerDependencies: {
      "@zero-transfer/sdk": sdkVersion,
    },
  };
  writeFileSync(join(dir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

  // dist/index.mjs — named ESM re-exports of value-typed names.
  const mjsBody =
    valueNames.length > 0
      ? `export { ${valueNames.join(", ")} } from "@zero-transfer/sdk";\n`
      : "// No runtime values in this scope; types-only package.\nexport {};\n";
  writeFileSync(join(distDir, "index.mjs"), banner + mjsBody);

  // dist/index.cjs — CJS lazy getters for each value name.
  const cjsLines = [
    '"use strict";',
    'Object.defineProperty(exports, "__esModule", { value: true });',
    'const sdk = require("@zero-transfer/sdk");',
    ...valueNames.map(
      (name) =>
        `Object.defineProperty(exports, ${JSON.stringify(name)}, { enumerable: true, get: () => sdk[${JSON.stringify(name)}] });`,
    ),
  ];
  writeFileSync(join(distDir, "index.cjs"), `${banner}${cjsLines.join("\n")}\n`);

  // dist/index.d.ts — named TypeScript re-exports preserving value/type kinds.
  const dtsLines = [];
  if (valueNames.length > 0) {
    dtsLines.push(`export { ${valueNames.join(", ")} } from "@zero-transfer/sdk";`);
  }
  if (typeNames.length > 0) {
    dtsLines.push(`export type { ${typeNames.join(", ")} } from "@zero-transfer/sdk";`);
  }
  writeFileSync(join(distDir, "index.d.ts"), `${banner}${dtsLines.join("\n")}\n`);

  // Report any names that are not present in either the runtime SDK or the
  // declaration file (we can verify the latter by checking the dist .d.ts).
  for (const name of typeNames) {
    if (!sdkDeclaresType(name)) {
      missing.push({ scope: scope.name, name });
    }
  }
}

console.log(
  `Generated ${scopes.length} scoped packages (${totalValues} value exports, ${totalTypes} type exports) at version ${sdkVersion}.`,
);

if (missing.length > 0) {
  console.warn(
    `\nWARNING: ${missing.length} symbol(s) referenced by manifest are not declared in dist/index.d.ts:`,
  );
  for (const m of missing) {
    console.warn(`  - ${m.scope}: ${m.name}`);
  }
}

/**
 * Derives a small list of supplementary npm keywords from the scope name.
 * @param {string} name
 * @returns {string[]}
 */
function deriveKeywords(name) {
  /** @type {Record<string, string[]>} */
  const map = {
    core: ["core", "transfer-client", "sdk"],
    classic: ["ftp", "ftps", "sftp"],
    ftp: ["ftp"],
    ftps: ["ftps", "tls"],
    sftp: ["sftp", "ssh"],
    http: ["http", "https", "signed-url"],
    webdav: ["webdav"],
    s3: ["s3", "object-storage", "multipart"],
    "google-drive": ["google-drive", "google", "drive"],
    dropbox: ["dropbox"],
    "azure-blob": ["azure", "azure-blob", "blob"],
    mft: ["mft", "managed-file-transfer", "schedules", "audit"],
  };
  return map[name] ?? [];
}
