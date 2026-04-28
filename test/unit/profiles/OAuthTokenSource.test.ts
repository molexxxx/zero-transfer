import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  createOAuthTokenSecretSource,
  resolveSecret,
} from "../../../src/index";

describe("createOAuthTokenSecretSource", () => {
  it("invokes the refresh callback exactly once while the token is fresh", async () => {
    let calls = 0;
    let now = 1_000_000;
    const password = createOAuthTokenSecretSource(
      () => {
        calls += 1;
        return { accessToken: `tok-${calls}`, expiresInSeconds: 600 };
      },
      { now: () => now },
    );

    expect(await resolveSecret(password)).toBe("tok-1");
    now += 60_000;
    expect(await resolveSecret(password)).toBe("tok-1");
    expect(calls).toBe(1);
  });

  it("renews when expiry minus skewMs has passed", async () => {
    let calls = 0;
    let now = 1_000_000;
    const password = createOAuthTokenSecretSource(
      () => {
        calls += 1;
        return { accessToken: `tok-${calls}`, expiresInSeconds: 600 };
      },
      { now: () => now, skewMs: 60_000 },
    );

    expect(await resolveSecret(password)).toBe("tok-1");
    now += 600_000 - 60_000 + 1;
    expect(await resolveSecret(password)).toBe("tok-2");
    expect(calls).toBe(2);
  });

  it("treats tokens without expiry metadata as long-lived", async () => {
    let calls = 0;
    const password = createOAuthTokenSecretSource(() => {
      calls += 1;
      return { accessToken: `tok-${calls}` };
    });

    expect(await resolveSecret(password)).toBe("tok-1");
    expect(await resolveSecret(password)).toBe("tok-1");
    expect(calls).toBe(1);
  });

  it("respects an absolute expiresAt, preferring it over expiresInSeconds", async () => {
    let calls = 0;
    let now = 1_000_000;
    const password = createOAuthTokenSecretSource(
      () => {
        calls += 1;
        return {
          accessToken: `tok-${calls}`,
          expiresAt: new Date(now + 30_000),
          expiresInSeconds: 600,
        };
      },
      { now: () => now, skewMs: 0 },
    );

    expect(await resolveSecret(password)).toBe("tok-1");
    now += 31_000;
    expect(await resolveSecret(password)).toBe("tok-2");
    expect(calls).toBe(2);
  });

  it("coalesces concurrent renewals into a single refresh call", async () => {
    let calls = 0;
    let resolveRefresh: ((value: { accessToken: string }) => void) | undefined;
    const password = createOAuthTokenSecretSource(
      () => {
        calls += 1;
        return new Promise((resolve) => {
          resolveRefresh = resolve;
        });
      },
    );

    const a = resolveSecret(password);
    const b = resolveSecret(password);
    expect(calls).toBe(1);
    resolveRefresh?.({ accessToken: "tok-1" });
    expect(await a).toBe("tok-1");
    expect(await b).toBe("tok-1");
  });

  it("throws ConfigurationError when the callback returns an empty access token", async () => {
    const password = createOAuthTokenSecretSource(() => ({ accessToken: "" }));
    await expect(resolveSecret(password)).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("throws ConfigurationError on a non-positive expiresInSeconds", async () => {
    const password = createOAuthTokenSecretSource(() => ({
      accessToken: "tok",
      expiresInSeconds: 0,
    }));
    await expect(resolveSecret(password)).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("throws ConfigurationError when the refresh callback is not a function", () => {
    expect(() =>
      // @ts-expect-error - validating runtime guard
      createOAuthTokenSecretSource(undefined),
    ).toThrow(ConfigurationError);
  });

  it("rejects negative skewMs", () => {
    expect(() =>
      createOAuthTokenSecretSource(() => ({ accessToken: "tok" }), { skewMs: -1 }),
    ).toThrow(ConfigurationError);
  });
});
