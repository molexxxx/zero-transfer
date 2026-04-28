// @ts-check
/**
 * Publishes every workspace stub under packages/* to npm with provenance.
 *
 * Order matters: the SDK must already be published at the same version
 * because each stub depends on it. Run `npm publish` from the repo root
 * first (or ensure CI has already released the SDK), then run this script.
 *
 * Usage:
 *   node scripts/publish-package-stubs.mjs            # publishes all stubs
 *   node scripts/publish-package-stubs.mjs --dry-run  # pack + show metadata
 *   node scripts/publish-package-stubs.mjs --tag next # publish under a dist-tag
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const packagesDir = join(repoRoot, "packages");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const tagIndex = process.argv.indexOf("--tag");
const tag = tagIndex >= 0 ? process.argv[tagIndex + 1] : undefined;

const dirs = readdirSync(packagesDir).filter((entry) =>
  statSync(join(packagesDir, entry)).isDirectory(),
);

console.log(`Publishing ${dirs.length} stubs from packages/*${dryRun ? " (DRY RUN)" : ""}.`);

for (const entry of dirs) {
  const dir = join(packagesDir, entry);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const argv = ["publish", "--access=public"];
  if (dryRun) argv.push("--dry-run");
  if (tag) argv.push(`--tag=${tag}`);

  console.log(`\n→ ${pkg.name}@${pkg.version}`);
  const result = spawnSync("npm", argv, { cwd: dir, shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to publish ${pkg.name}; aborting.`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nDone${dryRun ? " (dry run)" : ""}.`);
