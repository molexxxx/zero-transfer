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

      return [key, redactValue(value)];
    }),
  );
}
