/**
 * Connection profile validation helpers.
 *
 * @module profiles/ProfileValidator
 */
import { Buffer } from "node:buffer";
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { ConnectionProfile, SshProfile, TlsProfile } from "../types/public";
import { resolveProviderId } from "../core/ProviderId";

/** TLS protocol versions accepted by Node's `SecureVersion` option. */
const TLS_VERSIONS = new Set(["TLSv1", "TLSv1.1", "TLSv1.2", "TLSv1.3"]);
/** Hex characters in a SHA-256 certificate fingerprint after separators are removed. */
const SHA256_FINGERPRINT_HEX_LENGTH = 64;
/** Raw SHA-256 digest byte length. */
const SHA256_DIGEST_BYTE_LENGTH = 32;

/**
 * Validates provider-neutral connection profile fields before provider lookup.
 *
 * @param profile - Profile to validate.
 * @returns The original profile when valid.
 * @throws {@link ConfigurationError} When required provider, host, or numeric fields are invalid.
 */
export function validateConnectionProfile(profile: ConnectionProfile): ConnectionProfile {
  if (resolveProviderId(profile) === undefined) {
    throw new ConfigurationError({
      message: "Connection profiles must include a provider or protocol",
      retryable: false,
    });
  }

  if (profile.host.trim().length === 0) {
    throw new ConfigurationError({
      message: "Connection profiles must include a non-empty host",
      retryable: false,
    });
  }

  if (profile.port !== undefined && !isValidPort(profile.port)) {
    throw new ConfigurationError({
      details: { port: profile.port },
      message: "Connection profile port must be an integer between 1 and 65535",
      retryable: false,
    });
  }

  if (profile.timeoutMs !== undefined && !isPositiveFiniteNumber(profile.timeoutMs)) {
    throw new ConfigurationError({
      details: { timeoutMs: profile.timeoutMs },
      message: "Connection profile timeoutMs must be a positive finite number",
      retryable: false,
    });
  }

  if (profile.tls !== undefined) {
    validateTlsProfile(profile.tls);
  }

  if (profile.ssh !== undefined) {
    validateSshProfile(profile.ssh);
  }

  return profile;
}

/**
 * Validates SSH profile policy fields that can be checked without resolving secrets.
 *
 * @param profile - SSH profile to validate.
 * @throws {@link ConfigurationError} When host-key pin values are invalid.
 */
function validateSshProfile(profile: SshProfile): void {
  validatePinnedHostKeySha256(profile.pinnedHostKeySha256);

  if (profile.algorithms !== undefined) {
    validateSshAlgorithms(profile.algorithms);
  }

  if (profile.agent !== undefined) {
    validateSshAgentSource(profile.agent);
  }

  if (
    profile.keyboardInteractive !== undefined &&
    typeof profile.keyboardInteractive !== "function"
  ) {
    throw new ConfigurationError({
      details: { keyboardInteractive: typeof profile.keyboardInteractive },
      message: "Connection profile ssh.keyboardInteractive must be a function when provided",
      retryable: false,
    });
  }

  if (profile.socketFactory !== undefined && typeof profile.socketFactory !== "function") {
    throw new ConfigurationError({
      details: { socketFactory: typeof profile.socketFactory },
      message: "Connection profile ssh.socketFactory must be a function when provided",
      retryable: false,
    });
  }
}

/**
 * Validates SSH algorithm override shape without duplicating ssh2's literal unions.
 *
 * @param value - Algorithm override object from an SSH profile.
 * @throws {@link ConfigurationError} When overrides are not object-shaped or contain empty lists.
 */
function validateSshAlgorithms(value: SshProfile["algorithms"]): void {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw createSshAlgorithmsError(value);
  }

  const algorithms = value as Record<string, unknown>;

  for (const [name, list] of Object.entries(algorithms)) {
    if (list === undefined) {
      continue;
    }

    if (Array.isArray(list)) {
      if (!isNonEmptyStringArray(list)) {
        throw createSshAlgorithmsError({ [name]: list });
      }

      continue;
    }

    if (typeof list !== "object" || list === null || Array.isArray(list)) {
      throw createSshAlgorithmsError({ [name]: list });
    }

    const operationLists = list as Record<string, unknown>;

    for (const [operation, operationList] of Object.entries(operationLists)) {
      if (!["append", "prepend", "remove"].includes(operation)) {
        throw createSshAlgorithmsError({ [name]: list });
      }

      if (
        typeof operationList !== "string" &&
        (!Array.isArray(operationList) || !isNonEmptyStringArray(operationList))
      ) {
        throw createSshAlgorithmsError({ [name]: list });
      }
    }
  }
}

function isNonEmptyStringArray(value: unknown[]): value is string[] {
  return value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0);
}

/**
 * Validates SSH agent source values.
 *
 * @param value - Agent socket path or agent implementation.
 * @throws {@link ConfigurationError} When the value is neither a non-empty path nor an agent object.
 */
function validateSshAgentSource(value: SshProfile["agent"]): void {
  if (typeof value === "string") {
    if (value.trim().length > 0) {
      return;
    }
  } else if (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { getIdentities?: unknown }).getIdentities === "function" &&
    typeof (value as { sign?: unknown }).sign === "function"
  ) {
    return;
  }

  throw new ConfigurationError({
    details: { agent: typeof value },
    message: "Connection profile ssh.agent must be a non-empty socket path or agent object",
    retryable: false,
  });
}

/**
 * Validates TLS profile policy fields that can be checked without resolving secrets.
 *
 * @param profile - TLS profile to validate.
 * @throws {@link ConfigurationError} When server name, boolean, or TLS-version fields are invalid.
 */
function validateTlsProfile(profile: TlsProfile): void {
  if (profile.servername !== undefined && profile.servername.trim().length === 0) {
    throw new ConfigurationError({
      message: "Connection profile tls.servername must be non-empty when provided",
      retryable: false,
    });
  }

  if (profile.rejectUnauthorized !== undefined && typeof profile.rejectUnauthorized !== "boolean") {
    throw new ConfigurationError({
      details: { rejectUnauthorized: profile.rejectUnauthorized },
      message: "Connection profile tls.rejectUnauthorized must be a boolean",
      retryable: false,
    });
  }

  validateTlsVersion(profile.minVersion, "minVersion");
  validateTlsVersion(profile.maxVersion, "maxVersion");
  validatePinnedFingerprint256(profile.pinnedFingerprint256);
}

/**
 * Validates SHA-256 certificate fingerprint pinning values.
 *
 * @param value - Single fingerprint or allowed fingerprint set from the TLS profile.
 * @throws {@link ConfigurationError} When a fingerprint is empty or not SHA-256 hex.
 */
function validatePinnedFingerprint256(value: TlsProfile["pinnedFingerprint256"]): void {
  if (value === undefined) {
    return;
  }

  const fingerprints = Array.isArray(value) ? value : [value];

  if (fingerprints.length === 0) {
    throw createPinnedFingerprintError(value);
  }

  for (const fingerprint of fingerprints) {
    if (typeof fingerprint !== "string" || !isSha256Fingerprint(fingerprint)) {
      throw createPinnedFingerprintError(value);
    }
  }
}

/**
 * Validates SHA-256 SSH host-key pinning values.
 *
 * @param value - Single fingerprint or allowed fingerprint set from the SSH profile.
 * @throws {@link ConfigurationError} When a fingerprint is empty or not a SHA-256 digest.
 */
function validatePinnedHostKeySha256(value: SshProfile["pinnedHostKeySha256"]): void {
  if (value === undefined) {
    return;
  }

  const fingerprints = Array.isArray(value) ? value : [value];

  if (fingerprints.length === 0) {
    throw createPinnedHostKeyError(value);
  }

  for (const fingerprint of fingerprints) {
    if (typeof fingerprint !== "string" || !isSshHostKeySha256Fingerprint(fingerprint)) {
      throw createPinnedHostKeyError(value);
    }
  }
}

/**
 * Checks whether a string is a supported SHA-256 certificate fingerprint.
 *
 * @param value - Candidate fingerprint string.
 * @returns `true` when the value is 64 hex characters after optional colons are removed.
 */
function isSha256Fingerprint(value: string): boolean {
  const normalized = value.trim().replace(/:/g, "");
  return normalized.length === SHA256_FINGERPRINT_HEX_LENGTH && /^[a-f0-9]+$/i.test(normalized);
}

/**
 * Checks whether a string is a supported SSH SHA-256 host-key fingerprint.
 *
 * @param value - Candidate fingerprint string.
 * @returns `true` when the value is OpenSSH SHA256 base64, bare base64, or SHA-256 hex.
 */
function isSshHostKeySha256Fingerprint(value: string): boolean {
  const trimmed = value.trim();

  if (isSha256Fingerprint(trimmed)) {
    return true;
  }

  const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;
  const padded = padBase64(bare);

  if (!/^[a-z0-9+/]+={0,2}$/i.test(padded)) {
    return false;
  }

  try {
    return Buffer.from(padded, "base64").byteLength === SHA256_DIGEST_BYTE_LENGTH;
  } catch {
    return false;
  }
}

function padBase64(value: string): string {
  const remainder = value.length % 4;

  return remainder === 0 ? value : `${value}${"=".repeat(4 - remainder)}`;
}

/**
 * Creates a consistent validation error for invalid certificate pin values.
 *
 * @param value - Invalid profile value included in diagnostics.
 * @returns Configuration error describing the supported fingerprint format.
 */
function createPinnedFingerprintError(value: unknown): ConfigurationError {
  return new ConfigurationError({
    details: { pinnedFingerprint256: value },
    message:
      "Connection profile tls.pinnedFingerprint256 must be a SHA-256 hex fingerprint or non-empty array of fingerprints",
    retryable: false,
  });
}

/**
 * Creates a consistent validation error for invalid SSH host-key pin values.
 *
 * @param value - Invalid profile value included in diagnostics.
 * @returns Configuration error describing the supported fingerprint formats.
 */
function createPinnedHostKeyError(value: unknown): ConfigurationError {
  return new ConfigurationError({
    details: { pinnedHostKeySha256: value },
    message:
      "Connection profile ssh.pinnedHostKeySha256 must be an OpenSSH SHA256, base64, or hex fingerprint or non-empty array of fingerprints",
    retryable: false,
  });
}

/**
 * Creates a consistent validation error for invalid SSH algorithm overrides.
 *
 * @param value - Invalid profile value included in diagnostics.
 * @returns Configuration error describing the expected ssh2-compatible shape.
 */
function createSshAlgorithmsError(value: unknown): ConfigurationError {
  return new ConfigurationError({
    details: { algorithms: value },
    message: "Connection profile ssh.algorithms must use SSH-compatible non-empty algorithm lists",
    retryable: false,
  });
}

/**
 * Validates a configured TLS protocol version string.
 *
 * @param value - TLS version value from the profile, if provided.
 * @param field - Profile field name used in diagnostics.
 * @throws {@link ConfigurationError} When the value is not one of Node's supported TLS versions.
 */
function validateTlsVersion(value: TlsProfile["minVersion"], field: string): void {
  if (value === undefined) {
    return;
  }

  if (!TLS_VERSIONS.has(value)) {
    throw new ConfigurationError({
      details: { [field]: value },
      message: `Connection profile tls.${field} must be a supported TLS version`,
      retryable: false,
    });
  }
}

function isValidPort(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 65_535;
}

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
