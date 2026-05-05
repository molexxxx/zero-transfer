// @ts-check
/**
 * Generates `package.json` for every `packages/*` workspace folder.
 *
 * The `dist/` artifacts for each scoped package are produced by `tsup` (via
 * `src/entries/<scope>.ts` entry points). This script only writes metadata so
 * that npm knows each workspace's name, version, dependencies, and publish
 * settings.
 *
 * Run with: `npm run packages:generate`. Per-package READMEs are produced by
 * `npm run docs:scopes`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { scopes } from "./scope-manifest.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const sdkVersion = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).version;

for (const scope of scopes) {
  const dir = join(repoRoot, "packages", scope.name);
  mkdirSync(dir, { recursive: true });

  // Every non-core scoped package depends on @zero-transfer/core so that
  // `npm i @zero-transfer/<protocol>` auto-installs the shared foundation.
  // Manifest-declared deps win on conflict, but we never ship duplicate keys.
  const dependencies = {
    ...(scope.name === "core" ? {} : { "@zero-transfer/core": `^${sdkVersion}` }),
    ...scope.deps,
  };

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
    ...(Object.keys(dependencies).length > 0 ? { dependencies } : {}),
    ...(scope.peerDeps && Object.keys(scope.peerDeps).length > 0
      ? {
          peerDependencies: scope.peerDeps,
          peerDependenciesMeta: Object.fromEntries(
            Object.keys(scope.peerDeps).map((name) => [name, { optional: true }]),
          ),
        }
      : {}),
  };

  writeFileSync(join(dir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
}

console.log(`Generated ${scopes.length} scoped package.json files at version ${sdkVersion}.`);

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
    ssh: ["ssh", "ssh2", "tunneling", "channels"],
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
