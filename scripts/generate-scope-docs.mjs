// @ts-check
/**
 * Generates per-scope documentation:
 *   - docs/scopes/<name>.md            — long-form scope page with API table.
 *   - docs/scopes/README.md            — index of all scopes.
 *   - packages/<name>/README.md        — richer per-package readme.
 *
 * Run after `npm run docs:md` so the typedoc-plugin-markdown output exists,
 * because the API-reference table links into docs/api-md/.
 *
 * After writing, every generated file is reformatted via Prettier so that the
 * `prettier --check` step of `npm run ci` always passes against generated
 * output (no manual reformat after `docs:scopes`).
 */
import { execSync } from "node:child_process";
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

const GITHUB_BLOB_URL = "https://github.com/tonywied17/zero-transfer/blob/main";
const GITHUB_TREE_URL = "https://github.com/tonywied17/zero-transfer/tree/main";

/** @param {string} from @param {string} to */
function relPosix(from, to) {
  return relative(from, to).split(sep).join("/");
}

/**
 * Build the public-surface table with absolute GitHub links so it renders
 * correctly on npmjs.com (which doesn't resolve relative repo paths).
 * @param {string[]} exportNames
 */
function exportsTableAbsolute(exportNames) {
  if (exportNames.length === 0) return "_None._";
  const rows = exportNames.map((name) => {
    const hit = symbolIndex.get(name);
    if (!hit) return `| \`${name}\` | _unresolved_ | — |`;
    const href = `${GITHUB_BLOB_URL}/docs/api-md/${hit.file}`;
    return `| [\`${name}\`](${href}) | ${hit.kind} | See API reference. |`;
  });
  return `| Symbol | Kind | Notes |\n| --- | --- | --- |\n${rows.join("\n")}`;
}

/**
 * Build the examples table with absolute GitHub links.
 * @param {string[]} examples
 */
function describeExamplesAbsolute(examples) {
  if (examples.length === 0) {
    return `_No dedicated example yet — see the [examples directory](${GITHUB_TREE_URL}/examples) for cross-scope showcases._`;
  }
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
    return `| [\`examples/${file}\`](${GITHUB_BLOB_URL}/examples/${file}) | ${summary} |`;
  });
  return `| Example | What it shows |\n| --- | --- |\n${rows.join("\n")}`;
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

/**
 * Picks a representative `import` snippet for a scope's README usage block.
 * Prefers a `create*ProviderFactory` if present, otherwise falls back to the
 * first three exports.
 * @param {{ name: string; exports: string[] }} scope
 */
function pickUsageImport(scope) {
  const factory = scope.exports.find((n) => /^create[A-Z].*ProviderFactory$/.test(n));
  if (factory) {
    return `import { ${factory} } from "@zero-transfer/${scope.name}";`;
  }
  const sample = scope.exports.slice(0, Math.min(3, scope.exports.length));
  return `import { ${sample.join(", ")} } from "@zero-transfer/${scope.name}";`;
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
    "## Public surface",
    "",
    `This is the actual surface published by [\`@zero-transfer/${scope.name}\`](https://www.npmjs.com/package/@zero-transfer/${scope.name}). These symbols are also available from [\`@zero-transfer/sdk\`](../api-md/README.md); the links below point to the full API reference:`,
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

  // Per-package README — full mirror of the scope page using absolute GitHub
  // links so it renders correctly on npmjs.com.
  const packageExportsBlock = exportsTableAbsolute(scope.exports);
  const packageExamplesBlock = describeExamplesAbsolute(scope.examples);
  const packageReadme = [
    `# @zero-transfer/${scope.name}`,
    "",
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
    "## Usage",
    "",
    "```ts",
    pickUsageImport(scope),
    "```",
    "",
    "## Public surface",
    "",
    `This package publishes a narrowed surface of **${scope.exports.length}** exports. These symbols are also available from [\`@zero-transfer/sdk\`](https://www.npmjs.com/package/@zero-transfer/sdk); the table below links into the full API reference:`,
    "",
    packageExportsBlock,
    "",
    "## Examples",
    "",
    packageExamplesBlock,
    "",
    "## Documentation",
    "",
    `- [Scope page](${GITHUB_BLOB_URL}/docs/scopes/${scope.name}.md)`,
    `- [Top-level README](${GITHUB_BLOB_URL}/README.md)`,
    `- [Full API reference](${GITHUB_BLOB_URL}/docs/api-md/README.md)`,
    `- [Capability matrix](${GITHUB_BLOB_URL}/README.md#capability-matrix)`,
    `- [Examples](${GITHUB_TREE_URL}/examples)`,
    "",
    "## License",
    "",
    "MIT © [Tony Wiedman](https://github.com/tonywied17)",
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
  "Each page lists the public surface for that package, capability notes, and the examples that exercise it.",
  "",
].join("\n");
writeFileSync(
  join(scopesDir, "README.md"),
  frontmatterless("ZeroTransfer scoped packages", indexBody),
);

// Reformat every generated file via Prettier so `npm run format:check`
// (run as part of `npm run ci` and the release pipeline) stays green.
const prettierTargets = [
  "docs/scopes/README.md",
  ...scopes.map((s) => `docs/scopes/${s.name}.md`),
  ...scopes.map((s) => `packages/${s.name}/README.md`),
];
const quoted = prettierTargets.map((p) => `"${p}"`).join(" ");
execSync(`npx --no-install prettier --log-level warn --write ${quoted}`, {
  cwd: repoRoot,
  stdio: "inherit",
});

console.log(`Generated docs/scopes/{${scopes.length} pages} and refreshed packages/*/README.md.`);
