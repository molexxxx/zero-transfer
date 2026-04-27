/**
 * Connection profile secret resolution helpers.
 *
 * @module profiles/resolveConnectionProfileSecrets
 */
import type { ConnectionProfile } from "../types/public";
import { resolveSecret, type ResolveSecretOptions, type SecretValue } from "./SecretSource";

/** Connection profile with username and password sources resolved. */
export interface ResolvedConnectionProfile extends Omit<
  ConnectionProfile,
  "password" | "username"
> {
  /** Resolved username or account identifier. */
  username?: SecretValue;
  /** Resolved password or credential bytes. */
  password?: SecretValue;
}

/**
 * Resolves username and password secret sources without mutating the original profile.
 *
 * @param profile - Profile containing optional secret sources.
 * @param options - Optional env and file-reader overrides.
 * @returns Profile copy with username and password resolved when present.
 */
export async function resolveConnectionProfileSecrets(
  profile: ConnectionProfile,
  options: ResolveSecretOptions = {},
): Promise<ResolvedConnectionProfile> {
  const { password, username, ...rest } = profile;
  const resolved: ResolvedConnectionProfile = { ...rest };

  if (username !== undefined) {
    resolved.username = await resolveSecret(username, options);
  }

  if (password !== undefined) {
    resolved.password = await resolveSecret(password, options);
  }

  return resolved;
}
