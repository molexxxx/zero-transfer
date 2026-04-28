import { describe, expect, it } from "vitest";
import { importOpenSshConfig, parseOpenSshConfig, resolveOpenSshHost } from "../../../../src/index";

const config = `
Host bastion bastion.alt
  HostName bastion.example.com
  User opsadmin
  Port 2222
  IdentityFile ~/.ssh/bastion_key
  ConnectTimeout 15
  ProxyJump jump.example.com
  KexAlgorithms curve25519-sha256,diffie-hellman-group14-sha256
  Ciphers aes256-gcm@openssh.com

Match originalhost foo
  User shouldNotApply

Host !secret-* prod-*
  HostName prod.example.com
  UserKnownHostsFile ~/.ssh/prod_known_hosts ~/.ssh/extra_known_hosts

# Defaults applied last so specific Host blocks win
Host *
  ServerAliveInterval 60
  IdentityFile ~/.ssh/id_ed25519
`;

describe("parseOpenSshConfig", () => {
  it("captures Host blocks and lower-cases directive keys", () => {
    const entries = parseOpenSshConfig(config);
    expect(entries.map((entry) => entry.patterns)).toEqual([
      ["bastion", "bastion.alt"],
      ["!secret-*", "prod-*"],
      ["*"],
    ]);
    expect(entries[0]?.options["hostname"]).toEqual(["bastion.example.com"]);
    expect(entries[0]?.options["identityfile"]).toEqual(["~/.ssh/bastion_key"]);
  });

  it("skips Match blocks", () => {
    const entries = parseOpenSshConfig(config);
    const matchEntry = entries.find((entry) => entry.patterns.includes("shouldNotApply"));
    expect(matchEntry).toBeUndefined();
  });
});

describe("resolveOpenSshHost", () => {
  it("merges directives with first-declaration wins", () => {
    const entries = parseOpenSshConfig(config);
    const resolved = resolveOpenSshHost(entries, "bastion");
    expect(resolved.options["hostname"]).toEqual(["bastion.example.com"]);
    expect(resolved.options["identityfile"]).toEqual(["~/.ssh/bastion_key"]);
    expect(resolved.matched).toHaveLength(2);
  });

  it("respects negation patterns", () => {
    const entries = parseOpenSshConfig(config);
    const allowed = resolveOpenSshHost(entries, "prod-web");
    expect(allowed.options["hostname"]).toEqual(["prod.example.com"]);
    const denied = resolveOpenSshHost(entries, "secret-data");
    expect(denied.options["hostname"]).toBeUndefined();
  });
});

describe("importOpenSshConfig", () => {
  it("builds an SFTP profile with merged identity, knownHosts, and algorithms", () => {
    const result = importOpenSshConfig({ alias: "bastion", text: config });
    expect(result.profile.provider).toBe("sftp");
    expect(result.profile.host).toBe("bastion.example.com");
    expect(result.profile.port).toBe(2222);
    expect(result.profile.timeoutMs).toBe(15000);
    expect(result.proxyJump).toBe("jump.example.com");
    const username = result.profile.username;
    if (typeof username !== "object" || username === null || !("value" in username)) {
      throw new Error("expected ValueSecretSource username");
    }
    expect(username.value).toBe("opsadmin");
    const ssh = result.profile.ssh;
    if (ssh === undefined) throw new Error("expected ssh");
    const privateKey = ssh.privateKey;
    if (typeof privateKey !== "object" || privateKey === null || !("path" in privateKey)) {
      throw new Error("expected FileSecretSource privateKey");
    }
    expect(privateKey.path).toContain("bastion_key");
    expect(ssh.algorithms?.kex).toEqual(["curve25519-sha256", "diffie-hellman-group14-sha256"]);
  });

  it("throws when neither text nor entries is supplied", () => {
    expect(() => importOpenSshConfig({ alias: "anything" })).toThrow(/requires either text/);
  });
});
