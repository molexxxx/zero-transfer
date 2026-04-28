/**
 * Per-scope package smoke tests.
 *
 * Verifies that every `packages/*` workspace:
 *   1. Has a `dist/index.cjs` that loads cleanly.
 *   2. Exports exactly the value-typed names declared in scope-manifest.mjs.
 *   3. Does NOT leak unrelated SDK exports (i.e. the surface is narrowed).
 */
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// @ts-expect-error -- ESM manifest has no declaration file; we type it below.
import { scopes } from "../../scripts/scope-manifest.mjs";

interface ScopeDefinition {
  name: string;
  title: string;
  summary: string;
  description: string;
  exports: string[];
  examples: string[];
}
const scopeList = scopes as ScopeDefinition[];

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const require_ = createRequire(import.meta.url);
const sdk = require_(join(repoRoot, "dist/index.cjs")) as Record<string, unknown>;
const sdkValueNames = new Set(Object.keys(sdk));

const packageDirs = readdirSync(join(repoRoot, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

describe("packages/* — narrowed scoped packages", () => {
  it("workspace has one folder per manifest scope", () => {
    const scopeNames = scopeList.map((s) => s.name).sort();
    expect(packageDirs).toEqual(scopeNames);
  });

  for (const scope of scopeList) {
    const valueNames = scope.exports.filter((name) => sdkValueNames.has(name));

    it(`@zero-transfer/${scope.name} exposes only its declared value exports`, () => {
      const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
      const actual = Object.keys(mod)
        .filter((k) => k !== "__esModule")
        .sort();
      expect(actual).toEqual([...valueNames].sort());
    });

    it(`@zero-transfer/${scope.name} does not include sibling-scope-only symbols`, () => {
      const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
      const declared = new Set(scope.exports);
      const otherScopeOnlyValueExport = scopeList
        .filter((other) => other.name !== scope.name)
        .flatMap((other) => other.exports)
        .filter((name) => sdkValueNames.has(name) && !declared.has(name));
      for (const name of otherScopeOnlyValueExport.slice(0, 5)) {
        expect(mod[name]).toBeUndefined();
      }
    });
  }
});
