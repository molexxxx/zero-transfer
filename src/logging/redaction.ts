/**
 * Secret redaction helpers for logs, events, and diagnostics.
 *
 * These functions focus on preserving useful operational context while removing
 * credentials and command payloads that should not appear in logs.
 *
 * @module logging/redaction
 */
/** Placeholder used when sensitive content has been removed. */
export const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERN = /(?:password|passphrase|privatekey|token|secret|username|user)$/i;
const SECRET_COMMAND_PATTERN = /^(PASS|USER|ACCT)\s+(.+)$/i;
const URL_KEY_PATTERN = /(?:url|uri|href)$/i;

/**
 * Checks whether an object key is likely to contain sensitive data.
 *
 * @param key - Object key to inspect.
 * @returns `true` when the key name should be redacted.
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key.replace(/[_-]/g, ""));
}

/**
 * Redacts sensitive FTP command payloads while preserving the command name.
 *
 * @param command - Raw command text such as `PASS secret` or `USER deploy`.
 * @returns Command text with secret arguments replaced by {@link REDACTED}.
 */
export function redactCommand(command: string): string {
  return command.replace(SECRET_COMMAND_PATTERN, (_fullMatch, commandName: string) => {
    return `${commandName.toUpperCase()} ${REDACTED}`;
  });
}

/**
 * Recursively redacts strings, arrays, and plain object values.
 *
 * @param value - Arbitrary value to sanitize for diagnostics.
 * @returns A redacted copy for arrays and objects, or the original primitive value.
 */
export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactCommand(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value !== null && typeof value === "object") {
    return redactObject(value as Record<string, unknown>);
  }

  return value;
}

/**
 * Redacts sensitive keys and nested values in a plain object.
 *
 * @param input - Object containing diagnostic fields.
 * @returns A shallow object copy with sensitive fields and nested secrets redacted.
 */
export function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (isSensitiveKey(key)) {
        return [key, REDACTED];
      }

      if (URL_KEY_PATTERN.test(key) && typeof value === "string") {
        return [key, redactUrlForLogging(value)];
      }

      return [key, redactValue(value)];
    }),
  );
}

/**
 * Strips credentials and query/fragment content from a URL before logging.
 *
 * Query strings routinely carry bearer material - SigV4 `X-Amz-Signature`
 * values, SAS tokens, signed-URL parameters - so the entire search and hash
 * segments are replaced rather than filtered key-by-key. Embedded
 * `user:password@` userinfo is removed. Origin and pathname are preserved
 * because they are what operators need to correlate a failing request.
 *
 * @param url - Absolute URL string or `URL` instance to sanitize.
 * @returns A loggable URL string, or {@link REDACTED} when the value cannot be
 * parsed as a URL (an unparsable value may still embed credentials).
 */
export function redactUrlForLogging(url: string | URL): string {
  let parsed: URL;
  try {
    parsed = typeof url === "string" ? new URL(url) : url;
  } catch {
    return REDACTED;
  }

  const origin = parsed.host.length > 0 ? `${parsed.protocol}//${parsed.host}` : parsed.protocol;
  const query = parsed.search.length > 0 ? `?${REDACTED}` : "";
  return `${origin}${parsed.pathname}${query}`;
}

/**
 * Converts an arbitrary thrown value into a JSON-safe, secret-free record.
 *
 * Structured SDK errors are serialized through their `toJSON()` (which already
 * redacts details); plain errors contribute name/message/stack-free context;
 * other values are stringified. Use this at every internal log site that
 * records a caught error.
 *
 * @param error - Caught value of unknown shape.
 * @returns A redacted, JSON-safe object describing the error.
 */
export function redactErrorForLogging(error: unknown): Record<string, unknown> {
  if (error !== null && typeof error === "object") {
    const candidate = error as { toJSON?: () => Record<string, unknown> };
    if (typeof candidate.toJSON === "function") {
      return redactObject(candidate.toJSON());
    }
  }

  if (error instanceof Error) {
    return redactObject({ message: error.message, name: error.name });
  }

  return { message: redactValue(typeof error === "string" ? error : String(error)) };
}
