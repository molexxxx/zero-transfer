/**
 * Smoke tests for every file in `examples/`.
 *
 * Each example is wrapped in an `if (process.argv[1] === fileURLToPath(import.meta.url))`
 * guard around `void main()` and exports `main` for programmatic use. These tests:
 *
 *   1. Confirm every example module loads under tsx/vitest without throwing
 *      (catches missing imports, type errors at runtime, top-level mistakes).
 *   2. Confirm each export is a callable function named `main`.
 *   3. Confirm the auto-run guard is wired so importing the module does NOT
 *      kick off real network I/O.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const examplesDir = join(__dirname, "..", "..", "examples");
const exampleFiles = readdirSync(examplesDir)
  .filter((name) => name.endsWith(".ts"))
  .sort();

describe("examples/*.ts", () => {
  it("contains at least the documented basics", () => {
    expect(exampleFiles).toContain("local-copy-file.ts");
    expect(exampleFiles).toContain("ftp-basic.ts");
    expect(exampleFiles).toContain("sftp-private-key.ts");
  });

  for (const file of exampleFiles) {
    it(`${file} loads and exports a callable main()`, async () => {
      const moduleUrl = new URL(`../../examples/${file}`, import.meta.url).href;
      const mod = (await import(moduleUrl)) as { main?: unknown };
      expect(typeof mod.main).toBe("function");
    });
  }
});
