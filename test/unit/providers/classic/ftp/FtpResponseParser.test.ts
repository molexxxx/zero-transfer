import { describe, expect, it } from "vitest";
import { ParseError } from "../../../../../src/errors/ZeroFTPError";
import { FtpResponseParser, parseFtpResponseLines } from "../../../../../src/providers/classic/ftp";

describe("FtpResponseParser", () => {
  it("parses a single-line completion response", () => {
    const parser = new FtpResponseParser();
    const responses = parser.push("220 Service ready\r\n");

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      code: 220,
      completion: true,
      message: "Service ready",
      status: "completion",
    });
  });

  it("parses multiline responses across chunks", () => {
    const parser = new FtpResponseParser();

    expect(parser.push("211-Features:\r\n UTF8\r\n")).toEqual([]);
    expect(parser.hasPendingResponse()).toBe(true);

    const responses = parser.push(" EPSV\r\n211 End\r\n");

    expect(responses).toHaveLength(1);
    expect(responses[0]?.lines).toEqual(["Features:", " UTF8", " EPSV", "End"]);
    expect(responses[0]?.raw).toContain("211-Features:");
    expect(parser.hasPendingResponse()).toBe(false);
  });

  it("classifies FTP response status families", () => {
    expect(parseFtpResponseLines(["150 File status okay"]).status).toBe("preliminary");
    expect(parseFtpResponseLines(["230 User logged in"]).status).toBe("completion");
    expect(parseFtpResponseLines(["331 Password required"]).status).toBe("intermediate");
    expect(parseFtpResponseLines(["421 Service unavailable"]).status).toBe("transientFailure");
    expect(parseFtpResponseLines(["550 Not found"]).status).toBe("permanentFailure");
  });

  it("rejects malformed response lines outside multiline responses", () => {
    const parser = new FtpResponseParser();

    expect(() => parser.push("not a response\r\n")).toThrow(ParseError);
  });

  it("keeps malformed inner multiline lines as response content", () => {
    const response = parseFtpResponseLines(["220-First", "middle line", "220 Last"]);

    expect(response.lines).toEqual(["First", "middle line", "Last"]);
  });

  it("rejects incomplete multiline responses", () => {
    expect(() => parseFtpResponseLines(["220-First", "middle line"])).toThrow(ParseError);
  });

  it("can reset partial parser state", () => {
    const parser = new FtpResponseParser();

    parser.push("220-First\r\n");
    parser.reset();

    expect(parser.hasPendingResponse()).toBe(false);
    expect(parser.push("220 Ready\r\n")[0]?.message).toBe("Ready");
  });
});
