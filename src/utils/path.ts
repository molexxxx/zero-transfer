/**
 * Remote path normalization and FTP command-argument safety helpers.
 *
 * The functions in this module avoid platform-specific local path behavior and reject
 * CR/LF characters before values can be interpolated into FTP commands.
 *
 * @module utils/path
 */
import { ConfigurationError } from "../errors/ZeroTransferError";

const UNSAFE_FTP_ARGUMENT_PATTERN = /[\r\n]/;

/**
 * Validates that an FTP command argument cannot inject additional command lines.
 *
 * @param value - Argument value to validate.
 * @param label - Human-readable argument label used in error messages.
 * @returns The original value when it is safe.
 * @throws {@link ConfigurationError} When the value contains CR or LF characters.
 */
export function assertSafeFtpArgument(value: string, label = "path"): string {
  if (UNSAFE_FTP_ARGUMENT_PATTERN.test(value)) {
    throw new ConfigurationError({
      message: `Unsafe FTP ${label}: CR and LF characters are not allowed`,
      retryable: false,
      details: {
        label,
      },
    });
  }

  return value;
}

/**
 * Normalizes a remote path using POSIX-style separators without escaping absolute roots.
 *
 * @param input - Remote path that may contain duplicate separators or dot segments.
 * @returns A normalized remote path, `/` for absolute root, or `.` for an empty relative path.
 * @throws {@link ConfigurationError} When the input contains unsafe CR or LF characters.
 */
export function normalizeRemotePath(input: string): string {
  assertSafeFtpArgument(input);

  if (input.length === 0) {
    return ".";
  }

  const isAbsolute = input.startsWith("/");
  const segments: string[] = [];

  for (const segment of input.split(/[\\/]+/)) {
    if (segment.length === 0 || segment === ".") {
      continue;
    }

    if (segment === "..") {
      if (segments.length > 0 && segments[segments.length - 1] !== "..") {
        segments.pop();
      } else if (!isAbsolute) {
        segments.push(segment);
      }
      continue;
    }

    segments.push(segment);
  }

  const normalized = segments.join("/");

  if (isAbsolute) {
    return normalized.length > 0 ? `/${normalized}` : "/";
  }

  return normalized.length > 0 ? normalized : ".";
}

/**
 * Joins remote path segments and normalizes the result.
 *
 * @param segments - Remote path segments to concatenate.
 * @returns A normalized remote path.
 * @throws {@link ConfigurationError} When any joined segment contains unsafe characters.
 */
export function joinRemotePath(...segments: string[]): string {
  if (segments.length === 0) {
    return ".";
  }

  return normalizeRemotePath(segments.join("/"));
}

/**
 * Extracts the final name segment from a normalized remote path.
 *
 * @param input - Remote path to inspect.
 * @returns The final path segment, or `/` when the input is the absolute root.
 * @throws {@link ConfigurationError} When the input contains unsafe characters.
 */
export function basenameRemotePath(input: string): string {
  const normalized = normalizeRemotePath(input);
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? normalized;
}
