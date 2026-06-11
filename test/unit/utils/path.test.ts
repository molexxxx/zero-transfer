import { describe, expect, it } from "vitest";
import { ConfigurationError } from "../../../src/errors/ZeroTransferError";
import {
  assertSafeFtpArgument,
  basenameRemotePath,
  joinRemotePath,
  normalizeRemotePath,
} from "../../../src/utils/path";

describe("remote path utilities", () => {
  it("rejects CRLF command-injection characters", () => {
    expect(assertSafeFtpArgument("/safe/file.txt")).toBe("/safe/file.txt");
    expect(() => assertSafeFtpArgument("/bad\r\nDELE /", "remotePath")).toThrow(ConfigurationError);
  });

  it("rejects NUL bytes in paths and arguments", () => {
    expect(() => assertSafeFtpArgument("/etc/passwd\0.txt")).toThrow(ConfigurationError);
    expect(() => normalizeRemotePath("/a/b\0/c")).toThrow(ConfigurationError);
    expect(() => joinRemotePath("/root", "evil\0name")).toThrow(ConfigurationError);
  });

  it("normalizes remote paths without escaping absolute roots", () => {
    expect(normalizeRemotePath("")).toBe(".");
    expect(normalizeRemotePath("/a//b/./c")).toBe("/a/b/c");
    expect(normalizeRemotePath("/a/b/../../..")).toBe("/");
    expect(normalizeRemotePath("a\\b\\..\\c")).toBe("a/c");
    expect(normalizeRemotePath("../a/./b")).toBe("../a/b");
  });

  it("joins and extracts remote path names", () => {
    expect(joinRemotePath()).toBe(".");
    expect(joinRemotePath("/root/", "child", "file.txt")).toBe("/root/child/file.txt");
    expect(basenameRemotePath("/root/child/file.txt")).toBe("file.txt");
    expect(basenameRemotePath("/")).toBe("/");
  });
});
