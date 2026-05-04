#!/usr/bin/env node
// @ts-check
/**
 * One-shot release pipeline.
 *
 * Usage:
 *   npm run release -- patch                 # 0.1.0 -> 0.1.1
 *   npm run release -- minor                 # 0.1.0 -> 0.2.0
 *   npm run release -- major                 # 0.1.0 -> 1.0.0
 *   npm run release -- prerelease alpha      # 0.1.0 -> 0.1.1-alpha.0
 *   npm run release -- prerelease alpha 0    # 0.1.0 -> 0.1.0-alpha.0 (no patch bump)
 *   npm run release -- 1.2.3                 # explicit version
 *
 * Pipeline:
 *   1. Verify clean working tree on `main`.
 *   2. Run `npm run ci` (lint, typecheck, test, build, pack:dry).
 *   3. `npm version <bump> --no-git-tag-version` to bump root package.json.
 *   4. `npm run packages:generate` to refresh every packages/<scope>/.
 *   5. `npm run docs:all` to regenerate HTML, Markdown, and per-scope docs.
 *   6. Stage everything, commit `chore(release): v<version>`, push to origin/main.
 *
 * Each scoped package is a self-contained bundle (no peerDep on @zero-transfer/sdk)
 * with zero runtime npm dependencies — SFTP/classic ship the native SSH stack
 * in-bundle.
 *
 * Pushing the bumped package.json triggers the `release-on-bump.yml` workflow,
 * which tags `v<version>` and creates a GitHub Release. That release event then
 * triggers the `release.yml` workflow, which publishes @zero-transfer/sdk and
 * all 12 narrowed @zero-transfer/* packages to npmjs using the NPM_TOKEN
 * secret (an automation token configured to bypass 2FA).
 *
 * Pass `--no-push` to stop after the local commit (useful for testing).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** @param {string} cmd */
function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

/** @param {string} cmd */
function capture(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

const args = process.argv.slice(2);
const noPush = args.includes("--no-push");
const positional = args.filter((arg) => !arg.startsWith("--"));

if (positional.length === 0) {
  console.error(
    "Usage: npm run release -- <patch|minor|major|prerelease [identifier]|x.y.z> [--no-push]",
  );
  process.exit(1);
}

// 1. Working tree must be clean and on main.
const branch = capture("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") {
  console.error(`refusing to release from branch '${branch}'; switch to main`);
  process.exit(1);
}
const status = capture("git status --porcelain");
if (status) {
  console.error("refusing to release with a dirty working tree:\n" + status);
  process.exit(1);
}

// 2. CI gate: lint + typecheck + tests + build + pack dry-run.
run("npm run ci");

// 3. Bump version.
const versionArgs = positional.join(" ");
run(`npm version ${versionArgs} --no-git-tag-version`);
const newVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
console.log(`\n→ new version: ${newVersion}`);

// 4. Regenerate scoped package.json files at the new version (tsup already built dist/).
run("npm run packages:generate");

// 5. Refresh docs (HTML, Markdown, scopes).
run("npm run docs:all");

// 6. Commit + push.
run("git add -A");
run(`git commit -m "chore(release): v${newVersion}"`);
if (!noPush) {
  run("git push origin main");
  console.log(
    `\n✓ Pushed v${newVersion}. GitHub Actions will tag, release, and publish all 13 @zero-transfer packages (12 self-contained scoped + 1 batteries-included SDK).`,
  );
} else {
  console.log(`\n✓ Committed v${newVersion} (no push). Run 'git push' to trigger the release.`);
}
