/**
 * Connection profile redaction helpers.
 *
 * @module profiles/ProfileRedactor
 */
import type { ConnectionProfile, SshProfile, TlsProfile, TlsSecretSource } from "../types/public";
import { REDACTED, redactObject } from "../logging/redaction";
import { redactSecretSource } from "./SecretSource";

/**
 * Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.
 *
 * @param profile - Connection profile to sanitize.
 * @returns Plain object safe to include in logs, traces, or validation reports.
 */
export function redactConnectionProfile(profile: ConnectionProfile): Record<string, unknown> {
  const { logger, password, signal, ssh, tls, username, ...rest } = profile;
  const redacted = redactObject(rest);

  if (username !== undefined) redacted.username = redactSecretSource(username);
  if (password !== undefined) redacted.password = redactSecretSource(password);
  if (ssh !== undefined) redacted.ssh = redactSshProfile(ssh);
  if (tls !== undefined) redacted.tls = redactTlsProfile(tls);
  if (signal !== undefined) redacted.signal = "[AbortSignal]";
  if (logger !== undefined) redacted.logger = REDACTED;

  return redacted;
}

/**
 * Redacts SSH private-key profile fields while preserving non-sensitive policy settings.
 *
 * @param profile - SSH profile to sanitize.
 * @returns Plain object safe to include in diagnostics.
 */
function redactSshProfile(profile: SshProfile): Record<string, unknown> {
  const { agent, keyboardInteractive, knownHosts, passphrase, privateKey, socketFactory, ...rest } =
    profile;
  const redacted = redactObject(rest);

  if (agent !== undefined) redacted.agent = REDACTED;
  if (privateKey !== undefined) redacted.privateKey = redactSecretSource(privateKey);
  if (passphrase !== undefined) redacted.passphrase = redactSecretSource(passphrase);
  if (knownHosts !== undefined) redacted.knownHosts = redactSshKnownHostsSource(knownHosts);
  if (keyboardInteractive !== undefined) redacted.keyboardInteractive = REDACTED;
  if (socketFactory !== undefined) redacted.socketFactory = REDACTED;

  return redacted;
}

/**
 * Redacts an SSH known_hosts source, preserving array shape for diagnostics.
 *
 * @param source - Single known_hosts source or ordered source array.
 * @returns Redacted source descriptor.
 */
function redactSshKnownHostsSource(source: NonNullable<SshProfile["knownHosts"]>): unknown {
  if (Array.isArray(source)) {
    return source.map((item) => redactSecretSource(item));
  }

  return redactSecretSource(source);
}

/**
 * Redacts certificate-bearing TLS profile fields while preserving non-sensitive policy settings.
 *
 * @param profile - TLS profile to sanitize.
 * @returns Plain object safe to include in diagnostics.
 */
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

/**
 * Redacts a TLS material source, preserving array shape for CA bundle diagnostics.
 *
 * @param source - Single secret source or ordered source array.
 * @returns Redacted source descriptor.
 */
function redactTlsSecretSource(source: TlsSecretSource): unknown {
  if (Array.isArray(source)) {
    return source.map((item) => redactSecretSource(item));
  }

  return redactSecretSource(source);
}
