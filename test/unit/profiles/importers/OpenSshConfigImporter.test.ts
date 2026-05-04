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

  it("uses the alias as host when HostName is not specified", () => {
    const result = importOpenSshConfig({ alias: "raw-host", text: "" });
    expect(result.profile.host).toBe("raw-host");
  });

  it("parses ssh_config with `Key = Value` syntax and quoted tokens", () => {
    const text = `Host ws
  HostName = "ws.example.com"
  User = ann
  Ciphers "aes128-gcm@openssh.com,aes256-gcm@openssh.com"
`;
    const result = importOpenSshConfig({ alias: "ws", text });
    expect(result.profile.host).toBe("ws.example.com");
    expect(result.profile.ssh?.algorithms?.cipher).toEqual([
      "aes128-gcm@openssh.com",
      "aes256-gcm@openssh.com",
    ]);
  });

  it("ignores comments and blank lines", () => {
    const text = `# top
Host h
  # mid
  HostName h.example.com
  Port 22
`;
    const entries = parseOpenSshConfig(text);
    expect(entries[0]?.options["hostname"]).toEqual(["h.example.com"]);
  });

  it("appends repeated directives in declaration order", () => {
    const text = `Host h
  IdentityFile ~/.ssh/a
  IdentityFile ~/.ssh/b
`;
    const entries = parseOpenSshConfig(text);
    expect(entries[0]?.options["identityfile"]).toEqual(["~/.ssh/a", "~/.ssh/b"]);
  });

  it("tolerates Match before any Host (no current entry)", () => {
    const text = `Match all
  User x
Host real
  HostName r.example.com
`;
    const entries = parseOpenSshConfig(text);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.patterns).toEqual(["real"]);
  });

  it("ignores invalid Port values", () => {
    const text = `Host h
  HostName h.example.com
  Port not-a-port
`;
    const result = importOpenSshConfig({ alias: "h", text });
    expect(result.profile.port).toBeUndefined();
  });

  it("ignores invalid ConnectTimeout values", () => {
    const text = `Host h
  HostName h.example.com
  ConnectTimeout nope
`;
    const result = importOpenSshConfig({ alias: "h", text });
    expect(result.profile.timeoutMs).toBeUndefined();
  });

  it("expands `~` and `~/` to the user home directory", () => {
    const originalHome = process.env["HOME"];
    process.env["HOME"] = "/tmp/home";
    try {
      const text = `Host h
  HostName h.example.com
  IdentityFile ~/.ssh/id_rsa
  UserKnownHostsFile ~/.ssh/known
`;
      const result = importOpenSshConfig({ alias: "h", text });
      expect(result.identityFiles[0]).toBe("/tmp/home/.ssh/id_rsa");
      const knownHosts = result.profile.ssh?.knownHosts;
      const first = Array.isArray(knownHosts) ? knownHosts[0] : knownHosts;
      expect(first).toEqual({ path: "/tmp/home/.ssh/known" });
    } finally {
      if (originalHome === undefined) delete process.env["HOME"];
      else process.env["HOME"] = originalHome;
    }
  });

  it("leaves `~` literal when neither HOME nor USERPROFILE is set", () => {
    const originalHome = process.env["HOME"];
    const originalUser = process.env["USERPROFILE"];
    delete process.env["HOME"];
    delete process.env["USERPROFILE"];
    try {
      const text = `Host h
  HostName h.example.com
  IdentityFile ~/.ssh/key
`;
      const result = importOpenSshConfig({ alias: "h", text });
      expect(result.identityFiles[0]).toBe("~/.ssh/key");
    } finally {
      if (originalHome !== undefined) process.env["HOME"] = originalHome;
      if (originalUser !== undefined) process.env["USERPROFILE"] = originalUser;
    }
  });

  it("does not expand absolute paths that do not start with `~`", () => {
    const text = `Host h
  HostName h.example.com
  IdentityFile /etc/ssh/keys/host_key
`;
    const result = importOpenSshConfig({ alias: "h", text });
    expect(result.identityFiles[0]).toBe("/etc/ssh/keys/host_key");
  });

  it("accepts pre-parsed entries via `entries`", () => {
    const text = `Host h
  HostName h.example.com
  User u
`;
    const entries = parseOpenSshConfig(text);
    const result = importOpenSshConfig({ alias: "h", entries });
    expect(result.profile.host).toBe("h.example.com");
  });

  it("returns a profile without ssh when no ssh-affecting directives are present", () => {
    const text = `Host h
  HostName h.example.com
`;
    const result = importOpenSshConfig({ alias: "h", text });
    expect(result.profile.ssh).toBeUndefined();
  });
});
