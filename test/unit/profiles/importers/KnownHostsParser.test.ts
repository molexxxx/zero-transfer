import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { matchKnownHostsEntry, parseKnownHosts } from "../../../../src/index";

describe("parseKnownHosts", () => {
  it("parses plain, hashed, marker, and commented entries", () => {
    const text = `
# top comment
example.com,192.0.2.1 ssh-ed25519 AAAA== owner=tony
[example.com]:2222 ssh-rsa BBBB==
@cert-authority *.example.com ssh-rsa CCCC==
@revoked baddie ssh-ed25519 DDDD==
|1|c2FsdA==|aGFzaA== ssh-ed25519 EEEE==

invalid line
`;
    const entries = parseKnownHosts(text);
    expect(entries).toHaveLength(5);
    expect(entries[0]?.hostPatterns).toEqual(["example.com", "192.0.2.1"]);
    expect(entries[0]?.comment).toBe("owner=tony");
    expect(entries[1]?.hostPatterns).toEqual(["[example.com]:2222"]);
    expect(entries[2]?.marker).toBe("cert-authority");
    expect(entries[3]?.marker).toBe("revoked");
    expect(entries[4]?.hashedSalt).toBe("c2FsdA==");
    expect(entries[4]?.hashedHash).toBe("aGFzaA==");
  });
});

describe("matchKnownHostsEntry", () => {
  it("matches plain hostnames on the default port", () => {
    const [entry] = parseKnownHosts("example.com ssh-ed25519 AAAA==");
    expect(entry).toBeDefined();
    if (!entry) throw new Error("missing entry");
    expect(matchKnownHostsEntry(entry, "example.com")).toBe(true);
    expect(matchKnownHostsEntry(entry, "example.com", 2222)).toBe(false);
    expect(matchKnownHostsEntry(entry, "other.com")).toBe(false);
  });

  it("matches bracketed [host]:port entries", () => {
    const [entry] = parseKnownHosts("[example.com]:2222 ssh-rsa BBBB==");
    if (!entry) throw new Error("missing entry");
    expect(matchKnownHostsEntry(entry, "example.com", 2222)).toBe(true);
    expect(matchKnownHostsEntry(entry, "example.com")).toBe(false);
  });

  it("honors negation patterns", () => {
    const [entry] = parseKnownHosts("*.example.com,!secret.example.com ssh-ed25519 CCCC==");
    if (!entry) throw new Error("missing entry");
    expect(matchKnownHostsEntry(entry, "host.example.com")).toBe(true);
    expect(matchKnownHostsEntry(entry, "secret.example.com")).toBe(false);
  });

  it("verifies hashed entries via HMAC-SHA1", () => {
    const salt = Buffer.from("zerotransfer-salt");
    const hash = createHmac("sha1", salt).update("example.com").digest("base64");
    const text = `|1|${salt.toString("base64")}|${hash} ssh-ed25519 EEEE==`;
    const [entry] = parseKnownHosts(text);
    if (!entry) throw new Error("missing entry");
    expect(matchKnownHostsEntry(entry, "example.com")).toBe(true);
    expect(matchKnownHostsEntry(entry, "other.com")).toBe(false);
  });
});
