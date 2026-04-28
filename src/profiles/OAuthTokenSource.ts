/**
 * OAuth bearer-token helpers for cloud-drive and object-storage providers.
 *
 * Cloud providers in this SDK accept a bearer token via `profile.password`,
 * which is resolved as a {@link SecretSource}. Long-lived access tokens are
 * rare in OAuth flows; instead, applications hold a refresh token (or use a
 * client-credentials grant) and exchange it for short-lived access tokens.
 *
 * {@link createOAuthTokenSecretSource} adapts an arbitrary refresh callback
 * into a `SecretProvider` (one of the accepted `SecretSource` shapes) that
 * caches the most recent access token until its expiry approaches, then
 * silently re-runs the refresh callback. The cache honours an optional
 * `skewMs` margin so tokens are renewed before they expire on the wire.
 *
 * @module profiles/OAuthTokenSource
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { SecretProvider } from "./SecretSource";

/** Token material returned by {@link OAuthRefreshCallback}. */
export interface OAuthAccessToken {
  /** Access token value. Required. */
  accessToken: string;
  /**
   * Lifetime in seconds (`expires_in`-style). When provided, the helper caches
   * the token until `now + (expiresInSeconds - skewSeconds)`.
   */
  expiresInSeconds?: number;
  /** Absolute expiry. Wins over `expiresInSeconds` when both are provided. */
  expiresAt?: Date;
}

/** Refresh callback invoked when no valid cached token is available. */
export type OAuthRefreshCallback = () =>
  | OAuthAccessToken
  | Promise<OAuthAccessToken>;

/** Options accepted by {@link createOAuthTokenSecretSource}. */
export interface OAuthTokenSecretSourceOptions {
  /**
   * Safety margin (in milliseconds) subtracted from the token's expiry to
   * trigger a refresh before the wire deadline. Defaults to `60_000` (60s).
   */
  skewMs?: number;
  /** Clock used to evaluate expiry. Defaults to `Date.now`. */
  now?: () => number;
}

interface CachedToken {
  accessToken: string;
  /** Absolute expiry in epoch milliseconds, or `undefined` for non-expiring tokens. */
  expiresAtMs: number | undefined;
}

/**
 * Builds a {@link SecretProvider} that exchanges a refresh callback for
 * cached, auto-renewing access tokens.
 *
 * The returned function can be passed directly as `profile.password` for any
 * provider that accepts bearer tokens (Dropbox, Google Drive, OneDrive, GCS,
 * Azure Blob via AAD).
 *
 * @example
 * ```ts
 * const password = createOAuthTokenSecretSource(async () => {
 *   const res = await fetch("https://example.com/oauth/token", { ... });
 *   const body = (await res.json()) as { access_token: string; expires_in: number };
 *   return { accessToken: body.access_token, expiresInSeconds: body.expires_in };
 * });
 * const session = await factory.create().connect({ host: "", protocol: "ftp", password });
 * ```
 */
export function createOAuthTokenSecretSource(
  refresh: OAuthRefreshCallback,
  options: OAuthTokenSecretSourceOptions = {},
): SecretProvider {
  if (typeof refresh !== "function") {
    throw new ConfigurationError({
      message: "createOAuthTokenSecretSource requires a refresh callback",
      retryable: false,
    });
  }
  const skewMs = options.skewMs ?? 60_000;
  const now = options.now ?? (() => Date.now());
  if (skewMs < 0) {
    throw new ConfigurationError({
      message: "OAuthTokenSecretSourceOptions.skewMs must be non-negative",
      retryable: false,
    });
  }

  let cache: CachedToken | undefined;
  let pending: Promise<CachedToken> | undefined;

  const renew = async (): Promise<CachedToken> => {
    const result = await refresh();
    if (typeof result.accessToken !== "string" || result.accessToken === "") {
      throw new ConfigurationError({
        message: "OAuth refresh callback returned an empty access token",
        retryable: false,
      });
    }
    let expiresAtMs: number | undefined;
    if (result.expiresAt !== undefined) {
      const ts = result.expiresAt.getTime();
      if (Number.isFinite(ts)) expiresAtMs = ts;
    } else if (typeof result.expiresInSeconds === "number") {
      if (!Number.isFinite(result.expiresInSeconds) || result.expiresInSeconds <= 0) {
        throw new ConfigurationError({
          message: "OAuth refresh callback returned a non-positive expiresInSeconds",
          retryable: false,
        });
      }
      expiresAtMs = now() + result.expiresInSeconds * 1000;
    }
    const cached: CachedToken = { accessToken: result.accessToken, expiresAtMs };
    cache = cached;
    return cached;
  };

  return async () => {
    const current = cache;
    if (current !== undefined && isFresh(current, skewMs, now)) {
      return current.accessToken;
    }
    if (pending === undefined) {
      pending = renew().finally(() => {
        pending = undefined;
      });
    }
    const refreshed = await pending;
    return refreshed.accessToken;
  };
}

function isFresh(token: CachedToken, skewMs: number, now: () => number): boolean {
  if (token.expiresAtMs === undefined) return true;
  return token.expiresAtMs - skewMs > now();
}
