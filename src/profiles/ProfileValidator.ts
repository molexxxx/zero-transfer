/**
 * Connection profile validation helpers.
 *
 * @module profiles/ProfileValidator
 */
import { ConfigurationError } from "../errors/ZeroFTPError";
import type { ConnectionProfile } from "../types/public";
import { resolveProviderId } from "../core/ProviderId";

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

  return profile;
}

function isValidPort(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 65_535;
}

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
