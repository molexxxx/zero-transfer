/**
 * Connection profile validation helpers.
 *
 * @module profiles/ProfileValidator
 */
import { ConfigurationError } from "../errors/ZeroFTPError";
import type { ConnectionProfile, TlsProfile } from "../types/public";
import { resolveProviderId } from "../core/ProviderId";

const TLS_VERSIONS = new Set(["TLSv1", "TLSv1.1", "TLSv1.2", "TLSv1.3"]);

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

  return profile;
}

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
}

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
