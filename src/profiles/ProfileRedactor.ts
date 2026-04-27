/**
 * Connection profile redaction helpers.
 *
 * @module profiles/ProfileRedactor
 */
import type { ConnectionProfile, TlsProfile, TlsSecretSource } from "../types/public";
import { REDACTED, redactObject } from "../logging/redaction";
import { redactSecretSource } from "./SecretSource";

/**
 * Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.
 *
 * @param profile - Connection profile to sanitize.
 * @returns Plain object safe to include in logs, traces, or validation reports.
 */
export function redactConnectionProfile(profile: ConnectionProfile): Record<string, unknown> {
  const { logger, password, signal, tls, username, ...rest } = profile;
  const redacted = redactObject(rest);

  if (username !== undefined) redacted.username = redactSecretSource(username);
  if (password !== undefined) redacted.password = redactSecretSource(password);
  if (tls !== undefined) redacted.tls = redactTlsProfile(tls);
  if (signal !== undefined) redacted.signal = "[AbortSignal]";
  if (logger !== undefined) redacted.logger = REDACTED;

  return redacted;
}

function redactTlsProfile(profile: TlsProfile): Record<string, unknown> {
  const { ca, cert, checkServerIdentity, key, passphrase, pfx, ...rest } = profile;
  const redacted = redactObject(rest);

  if (ca !== undefined) redacted.ca = redactTlsSecretSource(ca);
  if (cert !== undefined) redacted.cert = redactSecretSource(cert);
  if (key !== undefined) redacted.key = redactSecretSource(key);
  if (passphrase !== undefined) redacted.passphrase = redactSecretSource(passphrase);
  if (pfx !== undefined) redacted.pfx = redactSecretSource(pfx);
  if (checkServerIdentity !== undefined) redacted.checkServerIdentity = REDACTED;

  return redacted;
}

function redactTlsSecretSource(source: TlsSecretSource): unknown {
  if (Array.isArray(source)) {
    return source.map((item) => redactSecretSource(item));
  }

  return redactSecretSource(source);
}
