import { defineConfig, type Options } from "tsup";

const shared: Options = {
  clean: false,
  dts: true,
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  target: "node20",
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".cjs" };
  },
};

/** Scopes that require ssh2 at runtime */
const SSH2_SCOPES = new Set(["sftp", "classic"]);

const scopedEntries: Options[] = [
  "core",
  "ftp",
  "ftps",
  "sftp",
  "classic",
  "http",
  "webdav",
  "s3",
  "google-drive",
  "dropbox",
  "azure-blob",
  "mft",
].map((scope) => ({
  ...shared,
  entry: { index: `src/entries/${scope}.ts` },
  outDir: `packages/${scope}/dist`,
  ...(SSH2_SCOPES.has(scope) ? { external: ["ssh2"] } : {}),
}));

export default defineConfig([
  // Full batteries-included SDK
  {
    ...shared,
    clean: true,
    entry: ["src/index.ts"],
    outDir: "dist",
    external: ["ssh2"],
  },
  // Per-scope self-contained bundles
  ...scopedEntries,
]);
