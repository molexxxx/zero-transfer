import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../src/errors/ZeroTransferError";
import {
  buildSshIdentificationLine,
  parseSshIdentificationLine,
} from "../../../../src/protocols/ssh/transport";

describe("SSH identification helpers", () => {
  it("builds and parses a canonical SSH identification line", () => {
    const line = buildSshIdentificationLine({
      comments: "zero-transfer dev",
      softwareVersion: "ZeroTransfer_0.2",
    });

    expect(line).toBe("SSH-2.0-ZeroTransfer_0.2 zero-transfer dev");
    expect(parseSshIdentificationLine(line)).toEqual({
      comments: "zero-transfer dev",
      protocolVersion: "2.0",
      raw: line,
      softwareVersion: "ZeroTransfer_0.2",
    });
  });

  it("parses identification lines without comments", () => {
    const line = "SSH-2.0-OpenSSH_9.9";
    expect(parseSshIdentificationLine(line)).toEqual({
      protocolVersion: "2.0",
      raw: line,
      softwareVersion: "OpenSSH_9.9",
    });
  });

  it("rejects malformed lines", () => {
    expect(() => parseSshIdentificationLine("HTTP/1.1 200 OK")).toThrow(ParseError);
    expect(() => buildSshIdentificationLine({ softwareVersion: "" })).toThrow(ParseError);
  });
});
