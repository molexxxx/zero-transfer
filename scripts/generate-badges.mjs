// @ts-check
/**
 * Generates shields.io endpoint JSON badges from local CI artifacts:
 *   - docs/api/badges/tests.json     (test count from vitest's JSON reporter)
 *   - docs/api/badges/coverage.json  (line % from coverage/coverage-summary.json)
 *
 * Both files are uploaded with the TypeDoc HTML to GitHub Pages so the
 * README's shield endpoints can read them at:
 *   https://tonywied17.github.io/zero-transfer/badges/<name>.json
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const outDir = join(repoRoot, "docs", "api", "badges");
mkdirSync(outDir, { recursive: true });

/** @param {string} path @returns {any} */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** @param {string} name @param {object} body */
function writeBadge(name, body) {
  const payload = { schemaVersion: 1, ...body };
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(payload, null, 2) + "\n");
  console.log(`badges: wrote ${name}.json -> ${payload.message}`);
}

// --- tests badge ------------------------------------------------------------
const testsReportPath = join(repoRoot, "coverage", "test-results.json");
if (existsSync(testsReportPath)) {
  const report = readJson(testsReportPath);
  const total = Number(report.numTotalTests ?? 0);
  const passed = Number(report.numPassedTests ?? 0);
  const failed = Number(report.numFailedTests ?? 0);
  const skipped = Number(report.numPendingTests ?? 0) + Number(report.numTodoTests ?? 0);
  const colour = failed > 0 ? "red" : "brightgreen";
  const message =
    failed > 0
      ? `${passed}/${total} (${failed} failing)`
      : skipped > 0
        ? `${passed} passing, ${skipped} skipped`
        : `${passed} passing`;
  writeBadge("tests", { label: "tests", message, color: colour });
} else {
  console.warn(`badges: ${testsReportPath} missing; writing fallback tests badge`);
  writeBadge("tests", { label: "tests", message: "unknown", color: "lightgrey" });
}

// --- coverage badge ---------------------------------------------------------
const coverageSummaryPath = join(repoRoot, "coverage", "coverage-summary.json");
if (existsSync(coverageSummaryPath)) {
  const summary = readJson(coverageSummaryPath);
  const linesPct = Number(summary?.total?.lines?.pct ?? 0);
  const rounded = Math.round(linesPct * 10) / 10;
  /** @type {string} */
  let colour = "red";
  if (rounded >= 90) colour = "brightgreen";
  else if (rounded >= 80) colour = "green";
  else if (rounded >= 70) colour = "yellowgreen";
  else if (rounded >= 60) colour = "yellow";
  else if (rounded >= 50) colour = "orange";
  writeBadge("coverage", { label: "coverage", message: `${rounded}%`, color: colour });
} else {
  console.warn(`badges: ${coverageSummaryPath} missing; writing fallback coverage badge`);
  writeBadge("coverage", { label: "coverage", message: "unknown", color: "lightgrey" });
}
