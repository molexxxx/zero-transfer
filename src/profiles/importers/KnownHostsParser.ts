/**
 * OpenSSH `known_hosts` parsing helpers used by SFTP profile imports and host-key verification.
 *
 * @module profiles/importers/KnownHostsParser
 */
import { Buffer } from "node:buffer";
import { createHmac } from "node:crypto";

/** Marker prefixing a known_hosts line (`@cert-authority` or `@revoked`). */
export type KnownHostsMarker = "cert-authority" | "revoked";

/** Parsed entry from an OpenSSH `known_hosts` file. */
export interface KnownHostsEntry {
  /** Optional line marker (`@cert-authority` or `@revoked`). */
  marker?: KnownHostsMarker;
  /** Raw, comma-separated host patterns. Negation patterns retain their leading `!`. */
  hostPatterns: readonly string[];
  /** Hashed-salt component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. */
  hashedSalt?: string;
  /** Hashed-hash component for `|1|salt|hash` entries. Mutually exclusive with plain patterns. */
  hashedHash?: string;
  /** SSH key algorithm identifier (e.g. `ssh-ed25519`, `ecdsa-sha2-nistp256`). */
  keyType: string;
  /** Base64-encoded public key blob. */
  keyBase64: string;
  /** Trailing comment text, if any. */
  comment?: string;
  /** Original line text without trailing newline. */
  raw: string;
}

/**
 * Parses OpenSSH `known_hosts` content into structured entries. Comment and blank lines are skipped.
 * Lines that cannot be parsed are silently dropped so callers can tolerate hand-edited files.
 *
 * @param text - Raw `known_hosts` file contents.
 * @returns Parsed entries in source order.
 */
export function parseKnownHosts(text: string): KnownHostsEntry[] {
  const entries: KnownHostsEntry[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const entry = parseKnownHostsLine(line);
    if (entry !== undefined) entries.push(entry);
  }
  return entries;
}

function parseKnownHostsLine(line: string): KnownHostsEntry | undefined {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length < 3) return undefined;
  let index = 0;
  let marker: KnownHostsMarker | undefined;
  const first = tokens[index];
  if (first === "@cert-authority" || first === "@revoked") {
    marker = first === "@cert-authority" ? "cert-authority" : "revoked";
    index += 1;
  }
  const hostField = tokens[index];
  const keyType = tokens[index + 1];
  const keyBase64 = tokens[index + 2];
  if (hostField === undefined || keyType === undefined || keyBase64 === undefined) return undefined;
  const commentTokens = tokens.slice(index + 3);
  const comment = commentTokens.length > 0 ? commentTokens.join(" ") : undefined;

  let hostPatterns: readonly string[] = [];
  let hashedSalt: string | undefined;
  let hashedHash: string | undefined;
  if (hostField.startsWith("|1|")) {
    const parts = hostField.split("|");
    if (parts.length < 4) return undefined;
    hashedSalt = parts[2];
    hashedHash = parts[3];
  } else {
    hostPatterns = hostField.split(",").filter((token) => token !== "");
  }

  const entry: KnownHostsEntry = {
    hostPatterns,
    keyBase64,
    keyType,
    raw: line,
  };
  if (marker !== undefined) entry.marker = marker;
  if (comment !== undefined) entry.comment = comment;
  if (hashedSalt !== undefined) entry.hashedSalt = hashedSalt;
  if (hashedHash !== undefined) entry.hashedHash = hashedHash;
  return entry;
}

/** Default OpenSSH port used when matching host patterns without an explicit `[host]:port`. */
const DEFAULT_SSH_PORT = 22;

/**
 * Returns true when the given host (and optional port) matches the entry's host patterns.
 * Hashed entries use HMAC-SHA1 verification per OpenSSH semantics.
 *
 * @param entry - Parsed `known_hosts` entry to test.
 * @param host - Hostname or IP literal to match.
 * @param port - Optional connection port. Defaults to {@link DEFAULT_SSH_PORT}.
 * @returns Whether the entry matches and is not negated.
 */
export function matchKnownHostsEntry(
  entry: KnownHostsEntry,
  host: string,
  port: number = DEFAULT_SSH_PORT,
): boolean {
  if (entry.hashedSalt !== undefined && entry.hashedHash !== undefined) {
    return matchesHashedEntry(entry.hashedSalt, entry.hashedHash, host, port);
  }
  let matched = false;
  for (const pattern of entry.hostPatterns) {
    if (pattern.startsWith("!")) {
      const negated = pattern.slice(1);
      if (matchesPlainPattern(negated, host, port)) return false;
      continue;
    }
    if (matchesPlainPattern(pattern, host, port)) matched = true;
  }
  return matched;
}

/**
 * Filters parsed entries down to those that match the given host/port. Negations are honored.
 *
 * @param entries - Entries returned by {@link parseKnownHosts}.
 * @param host - Hostname or IP literal to match.
 * @param port - Optional connection port. Defaults to {@link DEFAULT_SSH_PORT}.
 * @returns Matching entries in source order.
 */
export function matchKnownHosts(
  entries: readonly KnownHostsEntry[],
  host: string,
  port: number = DEFAULT_SSH_PORT,
): KnownHostsEntry[] {
  return entries.filter((entry) => matchKnownHostsEntry(entry, host, port));
}

function matchesPlainPattern(pattern: string, host: string, port: number): boolean {
  const portMatch = pattern.match(/^\[(.+)\]:(\d+)$/);
  if (portMatch) {
    const [, hostPattern, portText] = portMatch;
    if (hostPattern === undefined || portText === undefined) return false;
    const expectedPort = Number.parseInt(portText, 10);
    if (Number.isNaN(expectedPort) || expectedPort !== port) return false;
    return globMatch(hostPattern, host);
  }
  return port === DEFAULT_SSH_PORT && globMatch(pattern, host);
}

function globMatch(pattern: string, value: string): boolean {
  const regex = new RegExp(
    `^${pattern
      .replace(/[.+^${}()|\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".")}$`,
    "i",
  );
  return regex.test(value);
}

function matchesHashedEntry(salt: string, hash: string, host: string, port: number): boolean {
  const saltBuffer = Buffer.from(salt, "base64");
  if (saltBuffer.length === 0) return false;
  const candidates = port === DEFAULT_SSH_PORT ? [host] : [`[${host}]:${String(port)}`, host];
  for (const candidate of candidates) {
    const expected = createHmac("sha1", saltBuffer).update(candidate).digest("base64");
    if (expected === hash) return true;
  }
  return false;
}
