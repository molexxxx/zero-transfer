import { describe, expect, it } from "vitest";
import { ConnectionError } from "../../../src/errors/ZeroTransferError";
import {
  REDACTED,
  isSensitiveKey,
  redactCommand,
  redactErrorForLogging,
  redactObject,
  redactUrlForLogging,
  redactValue,
} from "../../../src/logging/redaction";

describe("redaction", () => {
  it("identifies sensitive field names", () => {
    expect(isSensitiveKey("password")).toBe(true);
    expect(isSensitiveKey("private_key")).toBe(true);
    expect(isSensitiveKey("username")).toBe(true);
    expect(isSensitiveKey("host")).toBe(false);
  });

  it("redacts secret FTP commands", () => {
    expect(redactCommand("PASS super-secret")).toBe(`PASS ${REDACTED}`);
    expect(redactCommand("user deploy")).toBe(`USER ${REDACTED}`);
    expect(redactCommand("ACCT billing")).toBe(`ACCT ${REDACTED}`);
    expect(redactCommand("NOOP")).toBe("NOOP");
  });

  it("redacts nested objects and arrays", () => {
    expect(
      redactObject({
        commands: ["PASS one", "PWD"],
        nested: { token: "abc", visible: true },
        password: "abc",
      }),
    ).toEqual({
      commands: [`PASS ${REDACTED}`, "PWD"],
      nested: { token: REDACTED, visible: true },
      password: REDACTED,
    });
    expect(redactValue(42)).toBe(42);
  });

  it("strips query strings and userinfo from URLs", () => {
    expect(
      redactUrlForLogging(
        "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=deadbeef&X-Amz-Credential=AKIA",
      ),
    ).toBe(`https://bucket.s3.amazonaws.com/key?${REDACTED}`);
    expect(redactUrlForLogging("https://user:hunter2@example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(redactUrlForLogging(new URL("http://example.com/plain"))).toBe(
      "http://example.com/plain",
    );
    expect(redactUrlForLogging("not a url")).toBe(REDACTED);
  });

  it("redacts string values under url-like keys in objects", () => {
    expect(
      redactObject({ host: "h", url: "https://example.com/k?token=abc" }),
    ).toEqual({ host: "h", url: `https://example.com/k?${REDACTED}` });
  });

  it("converts thrown values into redacted JSON-safe records", () => {
    const typed = new ConnectionError({
      details: { password: "hunter2", url: "https://example.com/k?sig=abc" },
      message: "boom",
      retryable: true,
    });
    const record = redactErrorForLogging(typed);
    expect(record["name"]).toBe("ConnectionError");
    expect(JSON.stringify(record)).not.toContain("hunter2");
    expect(JSON.stringify(record)).not.toContain("sig=abc");

    expect(redactErrorForLogging(new Error("plain failure"))).toEqual({
      message: "plain failure",
      name: "Error",
    });
    expect(redactErrorForLogging("PASS hunter2")).toEqual({ message: `PASS ${REDACTED}` });
  });
});
