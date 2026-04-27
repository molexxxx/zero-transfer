/**
 * Provider identifiers used by the provider-neutral ZeroTransfer core.
 *
 * @module core/ProviderId
 */

/** Classic remote-transfer providers kept compatible with the original protocol field. */
export const CLASSIC_PROVIDER_IDS = ["ftp", "ftps", "sftp"] as const;

/** Provider ids that map directly to the original protocol-focused alpha facade. */
export type ClassicProviderId = (typeof CLASSIC_PROVIDER_IDS)[number];

/** Provider ids reserved for first-party ZeroTransfer adapters. */
export type BuiltInProviderId =
  | ClassicProviderId
  | "memory"
  | "local"
  | "http"
  | "https"
  | "webdav"
  | "s3"
  | "azure-blob"
  | "gcs"
  | "dropbox"
  | "google-drive"
  | "one-drive";

/** Provider identifier accepted by registries, profiles, and provider factories. */
export type ProviderId = BuiltInProviderId | (string & {});

/** Minimal shape used to resolve a provider from new and compatibility profile fields. */
export interface ProviderSelection {
  /** Provider id for provider-neutral ZeroTransfer profiles. */
  provider?: ProviderId;
  /** Compatibility protocol field accepted while the provider-neutral API rolls out. */
  protocol?: ClassicProviderId;
}

/**
 * Checks whether a provider id belongs to the classic FTP/FTPS/SFTP family.
 *
 * @param providerId - Provider id to inspect.
 * @returns `true` when the id is one of the classic protocol providers.
 */
export function isClassicProviderId(
  providerId: ProviderId | undefined,
): providerId is ClassicProviderId {
  return (
    typeof providerId === "string" && CLASSIC_PROVIDER_IDS.includes(providerId as ClassicProviderId)
  );
}

/**
 * Resolves the provider id from a profile, preferring the new `provider` field.
 *
 * @param selection - Profile-like object containing provider and/or protocol fields.
 * @returns The selected provider id, or `undefined` when neither field is present.
 */
export function resolveProviderId(selection: ProviderSelection): ProviderId | undefined {
  return selection.provider ?? selection.protocol;
}
