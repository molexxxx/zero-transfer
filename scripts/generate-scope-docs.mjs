// @ts-check
/**
 * Generates per-scope documentation:
 *   - docs/scopes/<name>.md            — long-form scope page with API table.
 *   - docs/scopes/README.md            — index of all scopes.
 *   - packages/<name>/README.md        — richer per-package readme.
 *
 * Run after `npm run docs:md` so the typedoc-plugin-markdown output exists,
 * because the API-reference table links into docs/api-md/.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { scopes } from "./scope-manifest.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const apiMdRoot = join(repoRoot, "docs", "api-md");
const scopesDir = join(repoRoot, "docs", "scopes");
const examplesDir = join(repoRoot, "examples");

mkdirSync(scopesDir, { recursive: true });

/** Build a map of symbol name → { kind, relPath } from typedoc-plugin-markdown output. */
function buildSymbolIndex() {
  /** @type {Map<string, { kind: string, file: string }>} */
  const index = new Map();
  /** @type {{ dir: string, kind: string }[]} */
  const groups = [
    { dir: "classes", kind: "Class" },
    { dir: "functions", kind: "Function" },
    { dir: "interfaces", kind: "Interface" },
    { dir: "type-aliases", kind: "Type" },
    { dir: "variables", kind: "Variable" },
  ];
  for (const group of groups) {
    const groupDir = join(apiMdRoot, group.dir);
    let entries;
    try {
      entries = readdirSync(groupDir);
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!file.endsWith(".md")) continue;
      const symbol = file.replace(/\.md$/, "");
      // Existing entries (alphabetically earlier) win to keep deterministic output.
      if (!index.has(symbol)) {
        index.set(symbol, { file: posix.join(group.dir, file), kind: group.kind });
      }
    }
  }
  return index;
}

const symbolIndex = buildSymbolIndex();

/** @param {string} from @param {string} to */
function relPosix(from, to) {
  return relative(from, to).split(sep).join("/");
}

/** @param {string[]} examples */
function describeExamples(examples) {
  if (examples.length === 0)
    return "_No dedicated example yet — see the [examples directory](../../examples/) for cross-scope showcases._";
  const rows = examples.map((file) => {
    const path = join(examplesDir, file);
    let summary = "";
    try {
      const text = readFileSync(path, "utf8");
      const match = /\*\s+@file\s+([^\n]+)/.exec(text);
      if (match?.[1]) summary = match[1].trim();
    } catch {
      summary = "_(missing)_";
    }
    return `| [\`examples/${file}\`](../../examples/${file}) | ${summary} |`;
  });
  return `| Example | What it shows |\n| --- | --- |\n${rows.join("\n")}`;
}

/** @param {string[]} exportNames @param {string} fromFile */
function exportsTable(exportNames, fromFile) {
  if (exportNames.length === 0) return "_None._";
  const rows = exportNames.map((name) => {
    const hit = symbolIndex.get(name);
    if (!hit) return `| \`${name}\` | _unresolved_ | — |`;
    const linkTarget = relPosix(dirname(fromFile), join(apiMdRoot, hit.file));
    return `| [\`${name}\`](${linkTarget}) | ${hit.kind} | See API reference. |`;
  });
  return `| Symbol | Kind | Notes |\n| --- | --- | --- |\n${rows.join("\n")}`;
}

/** @param {string} title @param {string} body */
function frontmatterless(title, body) {
  return `# ${title}\n\n${body}\n`;
}

const scopeIndexRows = ["| Package | Summary |", "| --- | --- |"];

for (const scope of scopes) {
  const scopePageFile = join(scopesDir, `${scope.name}.md`);
  const examplesBlock = describeExamples(scope.examples);
  const exportsBlock = exportsTable(scope.exports, scopePageFile);

  const body = [
    `> ${scope.summary}`,
    "",
    "## Install",
    "",
    "```bash",
    `npm install @zero-transfer/${scope.name}`,
    "```",
    "",
    "## Overview",
    "",
    scope.description,
    "",
    "## Eventual public surface",
    "",
    "Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:",
    "",
    exportsBlock,
    "",
    "## Examples",
    "",
    examplesBlock,
    "",
    "## See also",
    "",
    `- [Top-level README](../../README.md)`,
    `- [Full API reference](../api-md/README.md)`,
    `- [Capability matrix](../../README.md#capability-matrix)`,
    `- [\`packages/${scope.name}\`](../../packages/${scope.name})`,
  ].join("\n");

  writeFileSync(scopePageFile, frontmatterless(scope.title, body));

  // Per-package README is a slimmed mirror of the scope page.
  const packageReadme = [
    `# @zero-transfer/${scope.name}`,
    "",
    `> ${scope.summary}`,
    "",
    `${scope.description}`,
    "",
    "> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.",
    "",
    "## Install",
    "",
    "```bash",
    `npm install @zero-transfer/${scope.name}`,
    "```",
    "",
    "## Usage",
    "",
    "```ts",
    `import { createTransferClient } from "@zero-transfer/${scope.name}";`,
    "",
    "const client = createTransferClient();",
    "```",
    "",
    "## Documentation",
    "",
    `- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/${scope.name}.md)`,
    `- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)`,
    `- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)`,
    "",
    "## License",
    "",
    "MIT © Tony Wiedman",
    "",
  ].join("\n");
  const pkgDir = join(repoRoot, "packages", scope.name);
  // ensure dir exists (stub generator already created it, but be defensive)
  try {
    statSync(pkgDir);
    writeFileSync(join(pkgDir, "README.md"), packageReadme);
  } catch {
    // package not scaffolded yet; skip silently.
  }

  scopeIndexRows.push(
    `| [\`@zero-transfer/${scope.name}\`](./${scope.name}.md) | ${scope.summary} |`,
  );
}

const indexBody = [
  "Per-scope documentation for every package in the [`@zero-transfer/*`](../../packages/) family.",
  "",
  scopeIndexRows.join("\n"),
  "",
  "Each page lists the eventual public surface, capability notes, and the examples that exercise it.",
  "",
].join("\n");
writeFileSync(
  join(scopesDir, "README.md"),
  frontmatterless("ZeroTransfer scoped packages", indexBody),
);

console.log(`Generated docs/scopes/{${scopes.length} pages} and refreshed packages/*/README.md.`);
