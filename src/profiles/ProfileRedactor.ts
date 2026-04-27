/**
 * Connection profile redaction helpers.
 *
 * @module profiles/ProfileRedactor
 */
import type { ConnectionProfile } from "../types/public";
import { REDACTED, redactObject } from "../logging/redaction";
import { redactSecretSource } from "./SecretSource";

/**
 * Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.
 *
 * @param profile - Connection profile to sanitize.
 * @returns Plain object safe to include in logs, traces, or validation reports.
 */
export function redactConnectionProfile(profile: ConnectionProfile): Record<string, unknown> {
  const { logger, password, signal, username, ...rest } = profile;
  const redacted = redactObject(rest);

  if (username !== undefined) redacted.username = redactSecretSource(username);
  if (password !== undefined) redacted.password = redactSecretSource(password);
  if (signal !== undefined) redacted.signal = "[AbortSignal]";
  if (logger !== undefined) redacted.logger = REDACTED;

  return redacted;
}
