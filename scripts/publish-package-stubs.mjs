// @ts-check
/**
 * Publishes every workspace package under packages/* to npm with provenance.
 *
 * Each scoped package is self-contained and has no peerDependency on
 * @zero-transfer/sdk, so publish order within the scoped packages does not
 * matter. The root SDK should be published first (or concurrently in CI)
 * so the workspace resolves cleanly.
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
const noProvenance = args.has("--no-provenance");
const tagIndex = process.argv.indexOf("--tag");
const tag = tagIndex >= 0 ? process.argv[tagIndex + 1] : undefined;
const userconfigIndex = process.argv.indexOf("--userconfig");
const userconfig = userconfigIndex >= 0 ? process.argv[userconfigIndex + 1] : undefined;

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
  if (noProvenance) argv.push("--provenance=false");
  if (userconfig) argv.push(`--userconfig=${userconfig}`);

  console.log(`\n→ ${pkg.name}@${pkg.version}`);
  const result = spawnSync("npm", argv, { cwd: dir, shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to publish ${pkg.name}; aborting.`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nDone${dryRun ? " (dry run)" : ""}.`);
