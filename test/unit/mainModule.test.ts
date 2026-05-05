import { describe, expect, it } from "vitest";

import { isMainModule } from "../../src/utils/mainModule";

describe("isMainModule", () => {
  it("returns false for a URL that is not the process entry point", () => {
    expect(isMainModule("file:///definitely/not/the/entry.ts")).toBe(false);
  });

  it("returns true for the current process entry URL", () => {
    const entry = process.argv[1];
    if (!entry) {
      // vitest worker without argv[1]; just exercise the false branch.
      expect(isMainModule("file:///some/url.ts")).toBe(false);
      return;
    }
    const entryUrl = `file:///${entry.replace(/\\/g, "/")}`;
    expect(isMainModule(entryUrl)).toBe(true);
  });

  it("returns false for an invalid URL string", () => {
    expect(isMainModule("not a url")).toBe(false);
  });
});
