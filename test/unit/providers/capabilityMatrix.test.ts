import { describe, expect, it } from "vitest";
import { formatCapabilityMatrixMarkdown, getBuiltinCapabilityMatrix } from "../../../src/index";

describe("getBuiltinCapabilityMatrix", () => {
  it("includes every shipped provider plus an S3 single-shot variant", () => {
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
      "s3:single-shot",
      "dropbox",
      "google-drive",
      "one-drive",
      "azure-blob",
      "gcs",
    ]);
  });

  it("flips resumeUpload between the S3 default (multipart) and single-shot entries", () => {
    const matrix = getBuiltinCapabilityMatrix();
    const s3 = matrix.find((entry) => entry.id === "s3");
    const s3SingleShot = matrix.find((entry) => entry.id === "s3:single-shot");
    expect(s3?.capabilities.resumeUpload).toBe(true);
    expect(s3SingleShot?.capabilities.resumeUpload).toBe(false);
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
    // header + divider + 14 entries
    expect(lines).toHaveLength(2 + 14);
    expect(markdown).toContain("S3-compatible (multipart uploads, default)");
    expect(markdown).toContain("Dropbox");
    expect(markdown).toContain("Google Drive");
    expect(markdown).toContain("OneDrive / SharePoint");
    expect(markdown).toContain("Azure Blob Storage");
    expect(markdown).toContain("Google Cloud Storage");
  });
});
