import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../../src/errors/ZeroFTPError";
import {
  parseMlsdLine,
  parseMlsdList,
  parseMlstTimestamp,
} from "../../../../../src/providers/classic/ftp";

const mlsdFixture = readFileSync(join(process.cwd(), "test/fixtures/ftp/mlsd.txt"), "utf8");

describe("FtpListParser", () => {
  it("parses MLSD entries into normalized remote entries", () => {
    const entries = parseMlsdList(mlsdFixture, "/releases");

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      name: "release.zip",
      path: "/releases/release.zip",
      permissions: { raw: "adfr" },
      size: 1024,
      type: "file",
      uniqueId: "801U1F4",
    });
    expect(entries[0]?.modifiedAt?.toISOString()).toBe("2026-04-27T01:02:03.123Z");
    expect(entries[1]).toMatchObject({ name: "builds", type: "directory" });
    expect(entries[2]).toMatchObject({ name: "target-link", type: "symlink" });
  });

  it("handles unknown and partial MLSD facts", () => {
    const entry = parseMlsdLine("type=weird;badfact; mystery", "/root");

    expect(entry).toMatchObject({
      name: "mystery",
      path: "/root/mystery",
      type: "unknown",
    });
    expect(entry.size).toBeUndefined();
    expect(entry.modifiedAt).toBeUndefined();
  });

  it("rejects malformed MLSD lines", () => {
    expect(() => parseMlsdLine("not-enough-data")).toThrow(ParseError);
  });

  it("parses valid MLST timestamps and ignores invalid ones", () => {
    expect(parseMlstTimestamp("20260427010203")?.toISOString()).toBe("2026-04-27T01:02:03.000Z");
    expect(parseMlstTimestamp("not-a-date")).toBeUndefined();
    expect(parseMlstTimestamp(undefined)).toBeUndefined();
  });
});
