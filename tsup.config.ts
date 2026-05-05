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

/** Scoped entry points; no third-party SSH/SFTP dependency - native stack ships in-bundle. */
const scopedEntries: Options[] = [
  "core",
  "ftp",
  "ftps",
  "sftp",
  "ssh",
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
}));

export default defineConfig([
  // Full batteries-included SDK
  {
    ...shared,
    clean: true,
    entry: ["src/index.ts"],
    outDir: "dist",
  },
  // Per-scope self-contained bundles
  ...scopedEntries,
]);
