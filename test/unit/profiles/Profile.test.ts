import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  redactConnectionProfile,
  redactSecretSource,
  resolveConnectionProfileSecrets,
  resolveSecret,
  validateConnectionProfile,
  type ConnectionProfile,
} from "../../../src/index";

describe("profile validation", () => {
  it("accepts provider-neutral and compatibility profiles", () => {
    const providerProfile: ConnectionProfile = { host: "memory.local", provider: "memory" };
    const protocolProfile: ConnectionProfile = { host: "ftp.example.test", protocol: "ftp" };

    expect(validateConnectionProfile(providerProfile)).toBe(providerProfile);
    expect(validateConnectionProfile(protocolProfile)).toBe(protocolProfile);
  });

  it("rejects invalid connection profile fields", () => {
    expect(() => validateConnectionProfile({ host: "files.example.test" })).toThrow(
      ConfigurationError,
    );
    expect(() => validateConnectionProfile({ host: " ", provider: "memory" })).toThrow(
      ConfigurationError,
    );
    expect(() =>
      validateConnectionProfile({ host: "memory.local", port: 0, provider: "memory" }),
    ).toThrow(ConfigurationError);
    expect(() =>
      validateConnectionProfile({ host: "memory.local", provider: "memory", timeoutMs: 0 }),
    ).toThrow(ConfigurationError);
    expect(() =>
      validateConnectionProfile({
        host: "memory.local",
        provider: "memory",
        tls: { servername: " " },
      }),
    ).toThrow(ConfigurationError);
    expect(() =>
      validateConnectionProfile({
        host: "memory.local",
        provider: "memory",
        tls: { minVersion: "SSLv3" as never },
      }),
    ).toThrow(ConfigurationError);
    expect(() =>
      validateConnectionProfile({
        host: "memory.local",
        provider: "memory",
        tls: { maxVersion: "SSLv3" as never },
      }),
    ).toThrow(ConfigurationError);
    expect(() =>
      validateConnectionProfile({
        host: "memory.local",
        provider: "memory",
        tls: { rejectUnauthorized: "yes" as never },
      }),
    ).toThrow(ConfigurationError);
  });
});

describe("secret sources", () => {
  it("resolves inline, env, base64 env, file, and callback secret sources", async () => {
    await expect(resolveSecret("inline-secret")).resolves.toBe("inline-secret");
    await expect(resolveSecret(Buffer.from("bytes"))).resolves.toEqual(Buffer.from("bytes"));
    await expect(
      resolveSecret({ env: "ZT_PASSWORD" }, { env: { ZT_PASSWORD: "from-env" } }),
    ).resolves.toBe("from-env");
    await expect(
      resolveSecret(
        { base64Env: "ZT_KEY" },
        { env: { ZT_KEY: Buffer.from("key").toString("base64") } },
      ),
    ).resolves.toEqual(Buffer.from("key"));
    await expect(
      resolveSecret({ path: "secret.txt" }, { readFile: () => Buffer.from("from-file") }),
    ).resolves.toBe("from-file");
    await expect(
      resolveSecret(
        { path: "secret.bin", encoding: "buffer" },
        { readFile: () => Buffer.from("raw") },
      ),
    ).resolves.toEqual(Buffer.from("raw"));
    await expect(resolveSecret(() => Promise.resolve("from-callback"))).resolves.toBe(
      "from-callback",
    );
  });

  it("raises typed errors for unavailable secret sources", async () => {
    await expect(resolveSecret({ env: "MISSING" }, { env: {} })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
    await expect(resolveSecret({ base64Env: "MISSING" }, { env: {} })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
    await expect(resolveSecret({ nope: true } as never)).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("redacts secret values and descriptors", () => {
    expect(redactSecretSource("secret")).toBe("[REDACTED]");
    expect(redactSecretSource(Buffer.from("secret"))).toBe("[REDACTED]");
    expect(redactSecretSource(() => "secret")).toBe("[REDACTED]");
    expect(redactSecretSource({ value: "secret" })).toEqual({ value: "[REDACTED]" });
    expect(redactSecretSource({ env: "ZT_PASSWORD" })).toEqual({ env: "[REDACTED]" });
    expect(redactSecretSource({ base64Env: "ZT_KEY" })).toEqual({ base64Env: "[REDACTED]" });
    expect(redactSecretSource({ path: "./secret.txt" })).toEqual({
      encoding: undefined,
      path: "[REDACTED]",
    });
    expect(redactSecretSource({ nope: true } as never)).toBe("[REDACTED]");
  });
});

describe("connection profile secrets", () => {
  it("resolves credentials without mutating the original profile", async () => {
    const profile: ConnectionProfile = {
      host: "sftp.example.test",
      password: { env: "ZT_PASSWORD" },
      provider: "sftp",
      tls: {
        ca: [{ env: "ZT_CA" }, { path: "ca.pem" }],
        cert: { env: "ZT_CERT" },
        key: { base64Env: "ZT_KEY" },
        passphrase: { env: "ZT_PASSPHRASE" },
        pfx: { path: "client.p12", encoding: "buffer" },
        servername: "files.example.test",
      },
      username: { value: "deploy" },
    };

    const resolved = await resolveConnectionProfileSecrets(profile, {
      env: {
        ZT_CA: "inline-ca",
        ZT_CERT: "client-cert",
        ZT_KEY: Buffer.from("private-key").toString("base64"),
        ZT_PASSWORD: "super-secret",
        ZT_PASSPHRASE: "key-passphrase",
      },
      readFile: () => Buffer.from("file-ca"),
    });

    expect(resolved).toMatchObject({
      host: "sftp.example.test",
      password: "super-secret",
      provider: "sftp",
      tls: {
        ca: ["inline-ca", "file-ca"],
        cert: "client-cert",
        key: Buffer.from("private-key"),
        passphrase: "key-passphrase",
        pfx: Buffer.from("file-ca"),
        servername: "files.example.test",
      },
      username: "deploy",
    });
    expect(profile.password).toEqual({ env: "ZT_PASSWORD" });
    expect(profile.tls?.key).toEqual({ base64Env: "ZT_KEY" });
  });

  it("leaves profiles without credential sources unchanged", async () => {
    await expect(
      resolveConnectionProfileSecrets({ host: "memory.local", provider: "memory" }),
    ).resolves.toEqual({ host: "memory.local", provider: "memory" });
  });

  it("redacts credential fields, runtime hooks, and sensitive profile values", () => {
    expect(
      redactConnectionProfile({
        host: "ftp.example.test",
        logger: { info: () => undefined },
        password: { env: "ZT_PASSWORD" },
        provider: "ftp",
        signal: new AbortController().signal,
        tls: {
          ca: [{ env: "ZT_CA" }],
          cert: { path: "client.pem" },
          checkServerIdentity: () => undefined,
          key: { path: "client.key" },
          passphrase: { env: "ZT_KEY_PASS" },
          rejectUnauthorized: true,
          servername: "files.example.test",
        },
        username: "deploy",
      }),
    ).toEqual({
      host: "ftp.example.test",
      logger: "[REDACTED]",
      password: { env: "[REDACTED]" },
      provider: "ftp",
      signal: "[AbortSignal]",
      tls: {
        ca: [{ env: "[REDACTED]" }],
        cert: { encoding: undefined, path: "[REDACTED]" },
        checkServerIdentity: "[REDACTED]",
        key: { encoding: undefined, path: "[REDACTED]" },
        passphrase: { env: "[REDACTED]" },
        rejectUnauthorized: true,
        servername: "files.example.test",
      },
      username: "[REDACTED]",
    });
    expect(redactConnectionProfile({ host: "memory.local", provider: "memory" })).toEqual({
      host: "memory.local",
      provider: "memory",
    });
    expect(
      redactConnectionProfile({
        host: "ftps.example.test",
        provider: "ftps",
        tls: {
          ca: { path: "ca.pem" },
          pfx: { path: "client.p12", encoding: "buffer" },
        },
      }),
    ).toEqual({
      host: "ftps.example.test",
      provider: "ftps",
      tls: {
        ca: { encoding: undefined, path: "[REDACTED]" },
        pfx: { encoding: "buffer", path: "[REDACTED]" },
      },
    });
  });
});
