import { describe, expect, it } from "vitest";
import {
  REDACTED,
  isSensitiveKey,
  redactCommand,
  redactObject,
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
});
