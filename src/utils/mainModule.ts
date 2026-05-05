/**
 * @file `isMainModule` - small helper for the rare case a script needs to
 * branch on whether it is the process entry point.
 *
 * Most code does not need this. Examples and CLIs should just put their work
 * at the top level of an ES module - top-level `await` is allowed, and any
 * thrown error propagates up so Node prints it and exits non-zero. No guard,
 * no wrapper, no `import.meta.url` plumbing required.
 *
 * If you do need the boolean (e.g. a file that is both a library and a CLI),
 * call `isMainModule(import.meta.url)`.
 */
import { fileURLToPath } from "node:url";

/**
 * Returns `true` when the file containing `import.meta.url` is the entry point
 * of the current Node.js process. Returns `false` outside Node.
 */
export function isMainModule(importMetaUrl: string): boolean {
  if (typeof process === "undefined" || !process.argv || process.argv.length < 2) {
    return false;
  }
  try {
    return process.argv[1] === fileURLToPath(importMetaUrl);
  } catch {
    return false;
  }
}
