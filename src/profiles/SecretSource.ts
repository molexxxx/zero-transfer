/**
 * Secret source contracts and resolution helpers for connection profiles.
 *
 * @module profiles/SecretSource
 */
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { ConfigurationError } from "../errors/ZeroTransferError";
import { REDACTED } from "../logging/redaction";

/** Resolved secret value accepted by profile credential fields. */
export type SecretValue = string | Buffer;

/** Callback source used by applications to integrate vaults or credential brokers. */
export type SecretProvider = () => SecretValue | Promise<SecretValue>;

/** Inline secret descriptor. Prefer env, path, or callback sources for real applications. */
export interface ValueSecretSource {
  /** Inline secret value. */
  value: SecretValue;
}

/** Environment variable descriptor for text secrets. */
export interface EnvSecretSource {
  /** Environment variable containing the secret. */
  env: string;
}

/** Environment variable descriptor for base64-encoded binary secrets. */
export interface Base64EnvSecretSource {
  /** Environment variable containing a base64-encoded secret. */
  base64Env: string;
}

/** File-backed secret descriptor. */
export interface FileSecretSource {
  /** Path to the file containing the secret. */
  path: string;
  /** Text encoding to use, or `buffer` to return raw bytes. Defaults to `utf8`. */
  encoding?: BufferEncoding | "buffer";
}

/** Secret source accepted by profile credential fields. */
export type SecretSource =
  | SecretValue
  | SecretProvider
  | ValueSecretSource
  | EnvSecretSource
  | Base64EnvSecretSource
  | FileSecretSource;

/** Injectable dependencies used by tests or host applications during secret resolution. */
export interface ResolveSecretOptions {
  /** Environment source. Defaults to `process.env`. */
  env?: NodeJS.ProcessEnv;
  /** File reader. Defaults to `fs.promises.readFile`. */
  readFile?: (path: string) => Promise<Buffer> | Buffer;
}

/**
 * Resolves a secret source into a string or Buffer without logging the value.
 *
 * @param source - Secret source to resolve.
 * @param options - Optional env and file-reader overrides.
 * @returns Resolved secret value.
 * @throws {@link ConfigurationError} When a descriptor is invalid or unavailable.
 */
export async function resolveSecret(
  source: SecretSource,
  options: ResolveSecretOptions = {},
): Promise<SecretValue> {
  if (isSecretValue(source)) {
    return cloneSecretValue(source);
  }

  if (typeof source === "function") {
    return cloneSecretValue(await source());
  }

  if (isValueSecretSource(source)) {
    return cloneSecretValue(source.value);
  }

  if (isEnvSecretSource(source)) {
    const value = (options.env ?? process.env)[source.env];

    if (value === undefined) {
      throw createSecretConfigurationError(
        "Secret environment variable is not set",
        "env",
        source.env,
      );
    }

    return value;
  }

  if (isBase64EnvSecretSource(source)) {
    const value = (options.env ?? process.env)[source.base64Env];

    if (value === undefined) {
      throw createSecretConfigurationError(
        "Secret environment variable is not set",
        "base64Env",
        source.base64Env,
      );
    }

    return Buffer.from(value, "base64");
  }

  if (isFileSecretSource(source)) {
    const fileReader = options.readFile ?? readFile;
    const value = await fileReader(source.path);

    if (source.encoding === "buffer") {
      return Buffer.from(value);
    }

    return value.toString(source.encoding ?? "utf8");
  }

  throw createSecretConfigurationError("Unsupported secret source", "source", "unknown");
}

/**
 * Redacts a secret source or resolved secret for safe diagnostics.
 *
 * @param source - Secret source or resolved value to sanitize.
 * @returns Redacted placeholder or descriptor shape.
 */
export function redactSecretSource(source: SecretSource | SecretValue): unknown {
  if (isSecretValue(source) || typeof source === "function") {
    return REDACTED;
  }

  if (isValueSecretSource(source)) return { value: REDACTED };
  if (isEnvSecretSource(source)) return { env: REDACTED };
  if (isBase64EnvSecretSource(source)) return { base64Env: REDACTED };
  if (isFileSecretSource(source)) return { encoding: source.encoding, path: REDACTED };

  return REDACTED;
}

function isSecretValue(value: unknown): value is SecretValue {
  return typeof value === "string" || Buffer.isBuffer(value);
}

function isValueSecretSource(value: unknown): value is ValueSecretSource {
  return isRecord(value) && "value" in value && isSecretValue(value.value);
}

function isEnvSecretSource(value: unknown): value is EnvSecretSource {
  return isRecord(value) && typeof value.env === "string";
}

function isBase64EnvSecretSource(value: unknown): value is Base64EnvSecretSource {
  return isRecord(value) && typeof value.base64Env === "string";
}

function isFileSecretSource(value: unknown): value is FileSecretSource {
  return isRecord(value) && typeof value.path === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cloneSecretValue(value: SecretValue): SecretValue {
  return Buffer.isBuffer(value) ? Buffer.from(value) : value;
}

function createSecretConfigurationError(
  message: string,
  sourceType: string,
  sourceName: string,
): ConfigurationError {
  return new ConfigurationError({
    details: { sourceName, sourceType },
    message,
    retryable: false,
  });
}
