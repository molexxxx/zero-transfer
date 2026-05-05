/**
 * Per-scope package smoke tests.
 *
 * Verifies that every `packages/*` workspace:
 *   1. Has `dist/index.cjs`, `dist/index.mjs`, and `dist/index.d.ts` artifacts.
 *   2. Has a CJS bundle that loads cleanly and exposes AT LEAST the scope-specific
 *      value names declared in `scripts/scope-manifest.mjs` (the bundle also
 *      includes the full core surface, so exact-match is not asserted).
 *   3. Does NOT expose provider-specific symbols from sibling scopes
 *      (e.g. `@zero-transfer/ftp` must not expose `createSftpProviderFactory`).
 *   4. Has a `package.json` with the metadata shape required for npm publication.
 *      No scope declares `ssh2` (the native SSH stack ships in-bundle), and no
 *      scope has a `peerDependency` on `@zero-transfer/sdk`.
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
  deps: Record<string, string>;
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

/** Cheap textual probe - `\b<name>\b` against the SDK's bundled .d.ts. */
function sdkDeclaresType(name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(sdkDts);
}

/** Provider-factory symbols that are strictly scoped to ONE non-core scope. */
const providerOnlyValuesByScope = new Map<string, Set<string>>();
for (const scope of scopeList) {
  if (scope.name === "core") continue;
  const providerValues = scope.exports.filter(
    (name) => sdkValueNames.has(name) && name.startsWith("create") && name.includes("Provider"),
  );
  if (providerValues.length > 0) {
    providerOnlyValuesByScope.set(scope.name, new Set(providerValues));
  }
}

describe("scripts/scope-manifest.mjs - manifest integrity", () => {
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

  it("no scoped package declares ssh2 as a dependency", () => {
    for (const scope of scopeList) {
      expect(scope.deps["ssh2"], `${scope.name}.deps.ssh2`).toBeUndefined();
    }
  });
});

describe("packages/* - self-contained scoped packages", () => {
  it("workspace has one folder per manifest scope", () => {
    const scopeNames = scopeList.map((s) => s.name).sort();
    expect(packageDirs).toEqual(scopeNames);
  });

  for (const scope of scopeList) {
    const scopeDir = join(repoRoot, "packages", scope.name);
    const distDir = join(scopeDir, "dist");
    const scopeValueNames = scope.exports.filter((name) => sdkValueNames.has(name));

    describe(`@zero-transfer/${scope.name}`, () => {
      it("has the three dist artifacts", () => {
        expect(existsSync(join(distDir, "index.cjs")), "dist/index.cjs").toBe(true);
        expect(existsSync(join(distDir, "index.mjs")), "dist/index.mjs").toBe(true);
        expect(existsSync(join(distDir, "index.d.ts")), "dist/index.d.ts").toBe(true);
      });

      it("CJS bundle exposes all declared scope-specific value exports", () => {
        const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
        for (const name of scopeValueNames) {
          expect(mod[name], `missing ${name}`).toBeDefined();
        }
      });

      it("CJS bundle exposes core symbols (self-contained)", () => {
        const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
        // All scoped packages bundle core infrastructure.
        expect(mod["createTransferClient"], "createTransferClient").toBeDefined();
        expect(mod["ZeroTransferError"], "ZeroTransferError").toBeDefined();
      });

      it("CJS bundle does not expose other scopes' provider factory symbols", () => {
        const mod = require_(`@zero-transfer/${scope.name}`) as Record<string, unknown>;
        const ownProviders = providerOnlyValuesByScope.get(scope.name) ?? new Set<string>();

        for (const [otherScope, otherProviders] of providerOnlyValuesByScope) {
          if (otherScope === scope.name) continue;
          // classic includes ftp+sftp so skip cross-checking classic vs its members
          if (scope.name === "classic") continue;
          for (const name of otherProviders) {
            if (!ownProviders.has(name)) {
              expect(
                mod[name],
                `should not expose ${name} from scope ${otherScope}`,
              ).toBeUndefined();
            }
          }
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

        // Self-contained bundles: no peerDependency on @zero-transfer/sdk.
        const peer = pkg.peerDependencies as Record<string, string> | undefined;
        expect(peer?.["@zero-transfer/sdk"]).toBeUndefined();

        // No scoped package depends on ssh2 - the native SSH stack ships in-bundle.
        const deps = pkg.dependencies as Record<string, string> | undefined;
        expect(deps?.["ssh2"], `${scope.name} must not declare ssh2`).toBeUndefined();

        const repo = pkg.repository as Record<string, string>;
        expect(repo.directory).toBe(`packages/${scope.name}`);

        const publish = pkg.publishConfig as Record<string, unknown>;
        expect(publish.access).toBe("public");
        expect(publish.provenance).toBe(true);
      });
    });
  }
});
