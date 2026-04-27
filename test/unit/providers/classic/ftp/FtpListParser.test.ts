import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../../src/errors/ZeroTransferError";
import {
  parseMlsdLine,
  parseMlsdList,
  parseMlstTimestamp,
  parseUnixList,
  parseUnixListLine,
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

  it("parses Unix LIST entries into normalized remote entries", () => {
    const entries = parseUnixList(
      [
        "total 8",
        "-rw-r--r-- 1 deploy staff 14 Apr 27 2026 report.csv",
        "drwxr-xr-x 2 deploy staff 4096 Apr 26 2026 builds",
        "lrwxrwxrwx 1 deploy staff 11 Apr 25 2026 current -> releases/v1",
      ].join("\n"),
      "/incoming",
    );

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      group: "staff",
      modifiedAt: new Date("2026-04-27T00:00:00.000Z"),
      name: "report.csv",
      owner: "deploy",
      path: "/incoming/report.csv",
      permissions: { raw: "-rw-r--r--" },
      size: 14,
      type: "file",
    });
    expect(entries[1]).toMatchObject({ name: "builds", type: "directory" });
    expect(entries[2]).toMatchObject({
      name: "current",
      symlinkTarget: "releases/v1",
      type: "symlink",
    });
  });

  it("parses Unix LIST timestamps that omit the year", () => {
    const entry = parseUnixListLine(
      "-rw-r--r-- 1 deploy staff 14 Apr 27 01:02 report.csv",
      "/incoming",
      new Date("2026-07-01T00:00:00.000Z"),
    );

    expect(entry.modifiedAt?.toISOString()).toBe("2026-04-27T01:02:00.000Z");
  });

  it("ignores invalid Unix LIST timestamps without dropping entries", () => {
    const entries = parseUnixList(
      [
        "-rw-r--r-- 1 deploy staff 14 Foo 27 2026 bad-month.csv",
        "-rw-r--r-- 1 deploy staff 14 Apr 99 2026 bad-day.csv",
        "-rw-r--r-- 1 deploy staff 14 Apr 27 25:99 bad-time.csv",
      ].join("\n"),
      "/incoming",
    );

    expect(entries.map((entry) => entry.name)).toEqual([
      "bad-month.csv",
      "bad-day.csv",
      "bad-time.csv",
    ]);
    expect(entries.every((entry) => entry.modifiedAt === undefined)).toBe(true);
  });

  it("handles uncommon Unix LIST entry types and symlinks without targets", () => {
    const entries = parseUnixList(
      [
        "crw-r----- 1 root wheel 0 Apr 27 2026 tty0",
        "lrwxrwxrwx 1 deploy staff 7 Apr 27 2026 current",
      ].join("\n"),
      "/dev",
    );

    expect(entries[0]).toMatchObject({ name: "tty0", type: "unknown" });
    expect(entries[1]).toMatchObject({ name: "current", type: "symlink" });
    expect(entries[1]?.symlinkTarget).toBeUndefined();
  });

  it("rejects malformed Unix LIST lines", () => {
    expect(() => parseUnixListLine("not-enough-data")).toThrow(ParseError);
  });

  it("parses valid MLST timestamps and ignores invalid ones", () => {
    expect(parseMlstTimestamp("20260427010203")?.toISOString()).toBe("2026-04-27T01:02:03.000Z");
    expect(parseMlstTimestamp("not-a-date")).toBeUndefined();
    expect(parseMlstTimestamp(undefined)).toBeUndefined();
  });
});
