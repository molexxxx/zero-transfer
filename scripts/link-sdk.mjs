// @ts-check
/**
 * Replace `node_modules/@zero-transfer/sdk` (which npm fetches from the
 * registry as a regular dependency of the workspace packages) with a junction
 * back to the repo root. This lets scoped workspace packages — which all
 * declare `@zero-transfer/sdk` as a dependency — resolve to the *local*
 * built `dist/` of this repo instead of the published version.
 *
 * Runs from `postinstall` so it is invoked after `npm install` / `npm ci` in
 * both local dev and CI.
 */
import { existsSync, lstatSync, rmSync, symlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const target = resolve(repoRoot, "node_modules", "@zero-transfer", "sdk");

if (!existsSync(resolve(repoRoot, "node_modules", "@zero-transfer"))) {
  // No workspaces installed yet (e.g. running from a tarball). Nothing to do.
  process.exit(0);
}

if (existsSync(target)) {
  const stat = lstatSync(target);
  if (stat.isSymbolicLink() || stat.isJunction?.() || stat.isDirectory()) {
    rmSync(target, { force: true, recursive: true });
  }
}

try {
  const linkType = process.platform === "win32" ? "junction" : "dir";
  symlinkSync(repoRoot, target, linkType);
  console.log(`[link-sdk] ${linkType} created: node_modules/@zero-transfer/sdk -> repo root`);
} catch (error) {
  console.warn(
    `[link-sdk] could not create link: ${error instanceof Error ? error.message : String(error)}`,
  );
}
