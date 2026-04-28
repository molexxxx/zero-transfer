// @ts-check
/**
 * Refactors examples/*.ts so they:
 *   1. import `fileURLToPath` from "node:url" (added at top of file after JSDoc),
 *   2. gate auto-run behind `process.argv[1] === fileURLToPath(import.meta.url)`,
 *   3. export `main` for tests / programmatic invocation.
 *
 * Idempotent: if a file is already guarded, it is skipped.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = join(repoRoot, "examples");
const files = readdirSync(examplesDir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
  const path = join(examplesDir, file);
  let text = readFileSync(path, "utf8");

  if (text.includes("fileURLToPath(import.meta.url)")) {
    console.log(`skip (already guarded): ${file}`);
    continue;
  }

  // 1. Add `import { fileURLToPath } from "node:url";` AFTER the first `from "..";` line.
  if (!text.includes(`from "node:url"`)) {
    const match = text.match(/^import [\s\S]*?from "[^"]+";\s*\n/m);
    if (!match || match.index === undefined) {
      console.warn(`no import block found in ${file}; skipping`);
      continue;
    }
    const insertAt = match.index + match[0].length;
    text =
      text.slice(0, insertAt) +
      `import { fileURLToPath } from "node:url";\n` +
      text.slice(insertAt);
  }

  // 2. Replace trailing `void main()...` invocation with a guarded block + export.
  const guard = `if (process.argv[1] === fileURLToPath(import.meta.url)) {\n  __INVOKE__\n}\n\nexport { main };\n`;

  const catchMatch = text.match(/^void main\(\)\.catch\(\(error: unknown\) => \{[\s\S]*?\}\);\n?/m);
  const plainMatch = text.match(/^void main\(\);\n?/m);

  if (catchMatch) {
    const invocation = catchMatch[0].trim();
    text = text.replace(catchMatch[0], guard.replace("__INVOKE__", invocation));
  } else if (plainMatch) {
    text = text.replace(plainMatch[0], guard.replace("__INVOKE__", "void main();"));
  } else {
    console.warn(`no top-level main invocation found in ${file}; skipping`);
    continue;
  }

  writeFileSync(path, text);
  console.log(`updated: ${file}`);
}
