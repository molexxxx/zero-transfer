import { describe, expect, it } from "vitest";
import {
  formatCapabilityMatrixMarkdown,
  getBuiltinCapabilityMatrix,
} from "../../../src/index";

describe("getBuiltinCapabilityMatrix", () => {
  it("includes every shipped provider plus an S3 multipart variant", () => {
    const ids = getBuiltinCapabilityMatrix().map((entry) => entry.id);
    expect(ids).toEqual([
      "local",
      "memory",
      "ftp",
      "ftps",
      "sftp",
      "http",
      "webdav",
      "s3",
      "s3:multipart",
      "dropbox",
    ]);
  });

  it("flips resumeUpload between the S3 single-shot and multipart entries", () => {
    const matrix = getBuiltinCapabilityMatrix();
    const s3 = matrix.find((entry) => entry.id === "s3");
    const s3Multipart = matrix.find((entry) => entry.id === "s3:multipart");
    expect(s3?.capabilities.resumeUpload).toBe(false);
    expect(s3Multipart?.capabilities.resumeUpload).toBe(true);
  });

  it("each entry advertises a non-empty authentication list", () => {
    for (const entry of getBuiltinCapabilityMatrix()) {
      expect(entry.capabilities.authentication.length).toBeGreaterThan(0);
    }
  });
});

describe("formatCapabilityMatrixMarkdown", () => {
  it("renders a header row, divider, and one row per provider", () => {
    const markdown = formatCapabilityMatrixMarkdown();
    const lines = markdown.split("\n");
    expect(lines[0]).toContain("Provider");
    expect(lines[1]).toMatch(/^\| --- \|/);
    // header + divider + 10 entries
    expect(lines).toHaveLength(2 + 10);
    expect(markdown).toContain("S3-compatible (multipart uploads)");
    expect(markdown).toContain("Dropbox");
  });
});
