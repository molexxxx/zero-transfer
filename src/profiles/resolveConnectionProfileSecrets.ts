/**
 * Connection profile secret resolution helpers.
 *
 * @module profiles/resolveConnectionProfileSecrets
 */
import type { ConnectionProfile, TlsProfile, TlsSecretSource } from "../types/public";
import { resolveSecret, type ResolveSecretOptions, type SecretValue } from "./SecretSource";

/** TLS profile with certificate-bearing secret sources resolved. */
export interface ResolvedTlsProfile extends Omit<
  TlsProfile,
  "ca" | "cert" | "key" | "passphrase" | "pfx"
> {
  /** Resolved certificate authority bundle. */
  ca?: SecretValue | SecretValue[];
  /** Resolved client certificate PEM. */
  cert?: SecretValue;
  /** Resolved client private key PEM. */
  key?: SecretValue;
  /** Resolved encrypted private-key or PFX/P12 passphrase. */
  passphrase?: SecretValue;
  /** Resolved PFX/P12 client certificate bundle. */
  pfx?: SecretValue;
}

/** Connection profile with username, password, and TLS material sources resolved. */
export interface ResolvedConnectionProfile extends Omit<
  ConnectionProfile,
  "password" | "tls" | "username"
> {
  /** Resolved username or account identifier. */
  username?: SecretValue;
  /** Resolved password or credential bytes. */
  password?: SecretValue;
  /** Resolved TLS profile when certificate material is configured. */
  tls?: ResolvedTlsProfile;
}

/**
 * Resolves credential and TLS material secret sources without mutating the original profile.
 *
 * @param profile - Profile containing optional secret sources.
 * @param options - Optional env and file-reader overrides.
 * @returns Profile copy with username, password, and TLS material resolved when present.
 */
export async function resolveConnectionProfileSecrets(
  profile: ConnectionProfile,
  options: ResolveSecretOptions = {},
): Promise<ResolvedConnectionProfile> {
  const { password, tls, username, ...rest } = profile;
  const resolved: ResolvedConnectionProfile = { ...rest };

  if (username !== undefined) {
    resolved.username = await resolveSecret(username, options);
  }

  if (password !== undefined) {
    resolved.password = await resolveSecret(password, options);
  }

  if (tls !== undefined) {
    resolved.tls = await resolveTlsProfile(tls, options);
  }

  return resolved;
}

/**
 * Resolves TLS certificate, key, PFX, passphrase, and CA source descriptors.
 *
 * @param profile - TLS profile containing optional secret-backed material.
 * @param options - Optional env and file-reader overrides.
 * @returns TLS profile copy with material sources resolved.
 */
async function resolveTlsProfile(
  profile: TlsProfile,
  options: ResolveSecretOptions,
): Promise<ResolvedTlsProfile> {
  const { ca, cert, key, passphrase, pfx, ...rest } = profile;
  const resolved: ResolvedTlsProfile = { ...rest };

  if (ca !== undefined) resolved.ca = await resolveTlsSecretSource(ca, options);
  if (cert !== undefined) resolved.cert = await resolveSecret(cert, options);
  if (key !== undefined) resolved.key = await resolveSecret(key, options);
  if (passphrase !== undefined) resolved.passphrase = await resolveSecret(passphrase, options);
  if (pfx !== undefined) resolved.pfx = await resolveSecret(pfx, options);

  return resolved;
}

/**
 * Resolves a TLS material source while preserving ordered CA bundle arrays.
 *
 * @param source - Single secret source or source array.
 * @param options - Optional env and file-reader overrides.
 * @returns Resolved secret value or resolved value array.
 */
async function resolveTlsSecretSource(
  source: TlsSecretSource,
  options: ResolveSecretOptions,
): Promise<SecretValue | SecretValue[]> {
  if (Array.isArray(source)) {
    return Promise.all(source.map((item) => resolveSecret(item, options)));
  }

  return resolveSecret(source, options);
}
