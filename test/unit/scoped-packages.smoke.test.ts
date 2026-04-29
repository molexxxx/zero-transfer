/**
 * Per-scope package smoke tests.
 *
 * Verifies that every `packages/*` workspace:
 *   1. Has `dist/index.cjs`, `dist/index.mjs`, and `dist/index.d.ts` artifacts.
 *   2. Has a CJS bundle that loads cleanly under Node and exposes exactly the
 *      value-typed names declared in `scripts/scope-manifest.mjs`.
 *   3. Does NOT leak unrelated SDK exports (i.e. the surface is narrowed).
 *   4. Has an ESM bundle that textually re-exports the same value names.
 *   5. Has a `dist/index.d.ts` that textually re-exports every type name from
 *      the manifest, AND every type name in the manifest is declared in the
 *      root SDK's `dist/index.d.ts`.
 *   6. Has a `package.json` with the metadata shape required for npm
 *      publication (name, version, peerDependencies pinned to the SDK version,
 *      files / exports / main / module / types, engines.node, license).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
const sdkDts = readFileSync(join(repoRoot, "dist/index.d.ts"), "utf8");
const sdkPackageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
  version: string;
};
const sdkVersion = sdkPackageJson.version;

const packageDirs = readdirSync(join(repoRoot, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** Cheap textual probe — `\b<name>\b` against the SDK's bundled .d.ts. */
function sdkDeclaresType(name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(sdkDts);
}

describe("scripts/scope-manifest.mjs — manifest integrity", () => {
  it("declares unique scope names", () => {
    const names = scopeList.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every scope has non-empty title, summary, description, and exports", () => {
    for (const scope of scopeList) {
      expect(scope.title, `${scope.name}.title`).toBeTruthy();
      expect(scope.summary, `${scope.name}.summary`).toBeTruthy();
      expect(scope.description, `${scope.name}.description`).toBeTruthy();
      expect(scope.exports.length, `${scope.name}.exports`).toBeGreaterThan(0);
    }
  });

  it("every export name is unique within its scope", () => {
    for (const scope of scopeList) {
      expect(new Set(scope.exports).size, `${scope.name}.exports`).toBe(scope.exports.length);
    }
  });

  it("every value name in the manifest is exported by the root SDK at runtime", () => {
    const orphans: { scope: string; name: string }[] = [];
    for (const scope of scopeList) {
      for (const name of scope.exports) {
        if (!sdkValueNames.has(name) && !sdkDeclaresType(name)) {
          orphans.push({ scope: scope.name, name });
        }
      }
    }
    expect(orphans).toEqual([]);
  });

  it("every type-only name in the manifest is declared in the SDK's dist/index.d.ts", () => {
    const missing: { scope: string; name: string }[] = [];
    for (const scope of scopeList) {
      const typeNames = scope.exports.filter((name) => !sdkValueNames.has(name));
      for (const name of typeNames) {
        if (!sdkDeclaresType(name)) {
          missing.push({ scope: scope.name, name });
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("packages/* — narrowed scoped packages", () => {
  it("workspace has one folder per manifest scope", () => {
    const scopeNames = scopeList.map((s) => s.name).sort();
    expect(packageDirs).toEqual(scopeNames);
  });

  for (const scope of scopeList) {
    const scopeDir = join(repoRoot, "packages", scope.name);
    const distDir = join(scopeDir, "dist");
    const valueNames = scope.exports.filter((name) => sdkValueNames.has(name));
    const typeNames = scope.exports.filter((name) => !sdkValueNames.has(name));

    describe(`@zero-transfer/${scope.name}`, () => {
      it("has the three generated dist artifacts", () => {
        expect(existsSync(join(distDir, "index.cjs")), "dist/index.cjs").toBe(true);
        expect(existsSync(join(distDir, "index.mjs")), "dist/index.mjs").toBe(true);
        expect(existsSync(join(distDir, "index.d.ts")), "dist/index.d.ts").toBe(true);
      });

      it("CJS bundle exposes exactly the declared value exports", () => {
        const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
        const actual = Object.keys(mod)
          .filter((k) => k !== "__esModule")
          .sort();
        expect(actual).toEqual([...valueNames].sort());
      });

      it("CJS bundle does not include sibling-scope-only symbols", () => {
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

      it("ESM bundle re-exports the declared value names from @zero-transfer/sdk", () => {
        const mjs = readFileSync(join(distDir, "index.mjs"), "utf8");
        if (valueNames.length === 0) {
          expect(mjs).toContain("export {}");
          return;
        }
        expect(mjs).toContain('from "@zero-transfer/sdk"');
        for (const name of valueNames) {
          expect(mjs, `mjs missing ${name}`).toMatch(new RegExp(`\\b${name}\\b`));
        }
      });

      it("d.ts re-exports the declared value and type names from @zero-transfer/sdk", () => {
        const dts = readFileSync(join(distDir, "index.d.ts"), "utf8");
        if (valueNames.length > 0) {
          expect(dts).toMatch(/^export \{[^}]+\} from "@zero-transfer\/sdk";$/m);
        }
        if (typeNames.length > 0) {
          expect(dts).toMatch(/^export type \{[^}]+\} from "@zero-transfer\/sdk";$/m);
        }
        for (const name of [...valueNames, ...typeNames]) {
          expect(dts, `d.ts missing ${name}`).toMatch(new RegExp(`\\b${name}\\b`));
        }
      });

      it("package.json has the metadata required for npm publication", () => {
        const pkgPath = join(scopeDir, "package.json");
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;

        expect(pkg.name).toBe(`@zero-transfer/${scope.name}`);
        expect(pkg.version).toBe(sdkVersion);
        expect(pkg.description).toBe(scope.summary);
        expect(pkg.license).toBe("MIT");
        expect(pkg.main).toBe("./dist/index.cjs");
        expect(pkg.module).toBe("./dist/index.mjs");
        expect(pkg.types).toBe("./dist/index.d.ts");
        expect(pkg.sideEffects).toBe(false);

        expect(pkg.exports).toEqual({
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.mjs",
            require: "./dist/index.cjs",
          },
          "./package.json": "./package.json",
        });

        const files = pkg.files as string[];
        expect(files).toEqual(expect.arrayContaining(["dist", "README.md", "LICENSE"]));

        const engines = pkg.engines as Record<string, string>;
        expect(engines.node).toMatch(/>=\s*20/);

        const peer = pkg.peerDependencies as Record<string, string>;
        expect(peer["@zero-transfer/sdk"]).toBe(sdkVersion);

        const repo = pkg.repository as Record<string, string>;
        expect(repo.directory).toBe(`packages/${scope.name}`);

        const publish = pkg.publishConfig as Record<string, unknown>;
        expect(publish.access).toBe("public");
        expect(publish.provenance).toBe(true);
      });
    });
  }
});
