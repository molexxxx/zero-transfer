import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFtpFeatures, parseFtpResponseLines } from "../../../../../src/providers/classic/ftp";

const featureFixture = readFileSync(join(process.cwd(), "test/fixtures/ftp/features.txt"), "utf8");

describe("parseFtpFeatures", () => {
  it("parses feature names and MLST facts from an FTP response", () => {
    const response = parseFtpResponseLines(featureFixture.trimEnd().split(/\r?\n/));
    const features = parseFtpFeatures(response);

    expect(features.supports("utf8")).toBe(true);
    expect(features.supports("EPSV")).toBe(true);
    expect(features.supports("missing")).toBe(false);
    expect(features.mlstFacts).toEqual(["type*", "size*", "modify*", "perm", "unique"]);
  });

  it("accepts raw strings and arrays", () => {
    expect(parseFtpFeatures(featureFixture).raw).toContain("REST STREAM");
    expect(parseFtpFeatures([" UTF8", "", "211 End"]).supports("UTF8")).toBe(true);
  });
});
