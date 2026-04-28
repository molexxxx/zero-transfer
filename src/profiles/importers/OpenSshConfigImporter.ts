/**
 * OpenSSH `ssh_config` parser and {@link ConnectionProfile} importer.
 *
 * Supports the directives most commonly used by SFTP profiles: `HostName`, `Port`, `User`,
 * `IdentityFile`, `UserKnownHostsFile`, `ProxyJump`, `ConnectTimeout`, plus the SSH algorithm
 * controls (`KexAlgorithms`, `Ciphers`, `MACs`, `HostKeyAlgorithms`).
 *
 * @module profiles/importers/OpenSshConfigImporter
 */
import { ConfigurationError } from "../../errors/ZeroTransferError";
import type { ConnectionProfile } from "../../types/public";

/** Parsed `Host` block from an OpenSSH config file. */
export interface OpenSshConfigEntry {
  /** Host patterns declared on the `Host` line. */
  patterns: readonly string[];
  /** Lower-cased directive name to ordered values. Multi-valued directives (e.g. `IdentityFile`) preserve order. */
  options: Readonly<Record<string, readonly string[]>>;
}

/**
 * Parses OpenSSH `ssh_config` text into structured `Host` blocks.
 *
 * The parser is intentionally permissive: unknown directives are retained and `Match` blocks are skipped.
 *
 * @param text - Contents of the `ssh_config` file.
 * @returns Parsed `Host` entries in source order.
 */
export function parseOpenSshConfig(text: string): OpenSshConfigEntry[] {
  const entries: OpenSshConfigEntry[] = [];
  let current: { patterns: string[]; options: Record<string, string[]> } | undefined;
  let skipping = false;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (line === "") continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*=?\s*(.*)$/);
    if (!match) continue;
    const [, keywordRaw, valueRaw] = match;
    if (keywordRaw === undefined || valueRaw === undefined) continue;
    const keyword = keywordRaw.toLowerCase();
    const value = valueRaw.trim();
    if (keyword === "host") {
      if (current !== undefined) entries.push(current);
      current = { options: {}, patterns: tokenizeValues(value) };
      skipping = false;
      continue;
    }
    if (keyword === "match") {
      if (current !== undefined) entries.push(current);
      current = undefined;
      skipping = true;
      continue;
    }
    if (skipping || current === undefined) continue;
    const values = tokenizeValues(value);
    const existing = current.options[keyword];
    if (existing === undefined) {
      current.options[keyword] = [...values];
    } else {
      existing.push(...values);
    }
  }
  if (current !== undefined) entries.push(current);
  return entries;
}

function tokenizeValues(value: string): string[] {
  if (value === "") return [];
  const tokens: string[] = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value)) !== null) {
    tokens.push(match[1] ?? match[2] ?? "");
  }
  return tokens;
}

/**
 * Resolved set of directives for a given host alias. Values from later-declared blocks are
 * merged after earlier ones so wildcard fallbacks (e.g. `Host *`) only fill gaps.
 */
export interface ResolvedOpenSshHost {
  /** Host alias the lookup was performed against. */
  alias: string;
  /** Per-directive ordered values, keyed by lower-cased directive name. */
  options: Readonly<Record<string, readonly string[]>>;
  /** Source entries that contributed to the resolved set, in match order. */
  matched: readonly OpenSshConfigEntry[];
}

/**
 * Resolves the merged option set for an OpenSSH host alias.
 *
 * @param entries - Parsed entries from {@link parseOpenSshConfig}.
 * @param alias - Host alias to resolve.
 * @returns Merged directive set with the matching entries.
 */
export function resolveOpenSshHost(
  entries: readonly OpenSshConfigEntry[],
  alias: string,
): ResolvedOpenSshHost {
  const merged: Record<string, string[]> = {};
  const matched: OpenSshConfigEntry[] = [];
  for (const entry of entries) {
    if (!entryMatchesAlias(entry, alias)) continue;
    matched.push(entry);
    for (const [key, values] of Object.entries(entry.options)) {
      if (merged[key] === undefined) merged[key] = [...values];
    }
  }
  return { alias, matched, options: merged };
}

function entryMatchesAlias(entry: OpenSshConfigEntry, alias: string): boolean {
  let matched = false;
  for (const pattern of entry.patterns) {
    if (pattern.startsWith("!")) {
      if (globMatch(pattern.slice(1), alias)) return false;
      continue;
    }
    if (globMatch(pattern, alias)) matched = true;
  }
  return matched;
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

/** Options accepted by {@link importOpenSshConfig}. */
export interface ImportOpenSshConfigOptions {
  /** Raw `ssh_config` text. Either this or {@link entries} must be provided. */
  text?: string;
  /** Pre-parsed entries from {@link parseOpenSshConfig}. */
  entries?: readonly OpenSshConfigEntry[];
  /** Host alias to import. */
  alias: string;
}

/** Result of {@link importOpenSshConfig}. */
export interface ImportOpenSshConfigResult {
  /** Generated SFTP connection profile. */
  profile: ConnectionProfile;
  /** Resolved directive set used to build the profile. */
  resolved: ResolvedOpenSshHost;
  /** Identity file paths declared in the config, in declaration order. */
  identityFiles: readonly string[];
  /** Optional `ProxyJump` value preserved from the config. */
  proxyJump?: string;
}

/**
 * Builds a {@link ConnectionProfile} for the given SSH alias from `ssh_config` text or pre-parsed entries.
 *
 * @param options - Import options.
 * @returns Importer result with the generated profile and supporting metadata.
 * @throws {@link ConfigurationError} When neither text nor entries is supplied.
 */
export function importOpenSshConfig(
  options: ImportOpenSshConfigOptions,
): ImportOpenSshConfigResult {
  const { alias } = options;
  const entries =
    options.entries ?? (options.text !== undefined ? parseOpenSshConfig(options.text) : undefined);
  if (entries === undefined) {
    throw new ConfigurationError({
      code: "openssh_config_input_missing",
      message: "importOpenSshConfig requires either text or pre-parsed entries.",
      retryable: false,
    });
  }
  const resolved = resolveOpenSshHost(entries, alias);
  const optionsMap = resolved.options;

  const host = first(optionsMap, "hostname") ?? alias;
  const portText = first(optionsMap, "port");
  const port = portText !== undefined ? safeInt(portText) : undefined;
  const user = first(optionsMap, "user");
  const identityFiles = optionsMap["identityfile"] ?? [];
  const knownHostsFiles = optionsMap["userknownhostsfile"] ?? [];
  const connectTimeoutText = first(optionsMap, "connecttimeout");
  const proxyJump = first(optionsMap, "proxyjump");
  const kex = optionsMap["kexalgorithms"] ?? [];
  const ciphers = optionsMap["ciphers"] ?? [];
  const macs = optionsMap["macs"] ?? [];
  const serverHostKey = optionsMap["hostkeyalgorithms"] ?? [];

  const profile: ConnectionProfile = { host, provider: "sftp" };
  if (port !== undefined) profile.port = port;
  if (user !== undefined) profile.username = { value: user };
  if (connectTimeoutText !== undefined) {
    const seconds = safeInt(connectTimeoutText);
    if (seconds !== undefined) profile.timeoutMs = seconds * 1000;
  }

  const ssh: NonNullable<ConnectionProfile["ssh"]> = {};
  if (identityFiles.length > 0) {
    const firstKey = identityFiles[0];
    if (firstKey !== undefined) ssh.privateKey = { path: expandHome(firstKey) };
  }
  if (knownHostsFiles.length > 0) {
    ssh.knownHosts = knownHostsFiles.map((path) => ({ path: expandHome(path) }));
  }
  const algorithms: Record<string, string[]> = {};
  if (kex.length > 0) algorithms["kex"] = expandAlgorithms(kex);
  if (ciphers.length > 0) algorithms["cipher"] = expandAlgorithms(ciphers);
  if (macs.length > 0) algorithms["hmac"] = expandAlgorithms(macs);
  if (serverHostKey.length > 0) algorithms["serverHostKey"] = expandAlgorithms(serverHostKey);
  if (Object.keys(algorithms).length > 0) {
    ssh.algorithms = algorithms;
  }
  if (Object.keys(ssh).length > 0) profile.ssh = ssh;

  const result: ImportOpenSshConfigResult = {
    identityFiles: identityFiles.map(expandHome),
    profile,
    resolved,
  };
  if (proxyJump !== undefined) result.proxyJump = proxyJump;
  return result;
}

function first(
  options: Readonly<Record<string, readonly string[]>>,
  key: string,
): string | undefined {
  const values = options[key];
  return values !== undefined && values.length > 0 ? values[0] : undefined;
}

function safeInt(text: string): number | undefined {
  const value = Number.parseInt(text, 10);
  return Number.isFinite(value) ? value : undefined;
}

function expandHome(path: string): string {
  if (!path.startsWith("~")) return path;
  const home = process.env["HOME"] ?? process.env["USERPROFILE"];
  if (home === undefined) return path;
  if (path === "~") return home;
  if (path.startsWith("~/") || path.startsWith("~\\")) return `${home}${path.slice(1)}`;
  return path;
}

function expandAlgorithms(values: readonly string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      if (trimmed !== "") out.push(trimmed);
    }
  }
  return out;
}
