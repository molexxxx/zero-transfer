/**
 * Structured ZeroFTP error hierarchy.
 *
 * The classes in this module preserve protocol details, retryability, command/path
 * context, and machine-readable codes so application code does not need to parse
 * human error messages.
 *
 * @module errors/ZeroFTPError
 */
import type { RemoteProtocol } from "../types/public";

/**
 * Complete set of fields required to create a ZeroFTP error.
 */
export interface ZeroFTPErrorDetails {
  /** Stable machine-readable error code. */
  code: string;
  /** Human-readable error message safe to show in logs or diagnostics. */
  message: string;
  /** Original error or exception that caused this error. */
  cause?: unknown;
  /** Protocol active when the error occurred. */
  protocol?: RemoteProtocol;
  /** Remote host associated with the failing operation. */
  host?: string;
  /** Protocol command associated with the failure, if any. */
  command?: string;
  /** FTP response code associated with the failure. */
  ftpCode?: number;
  /** SFTP status code associated with the failure. */
  sftpCode?: number;
  /** Remote path associated with the failure. */
  path?: string;
  /** Whether retry policy may safely retry this failure. */
  retryable: boolean;
  /** Additional structured details for diagnostics. */
  details?: Record<string, unknown>;
}

/**
 * Error construction input for subclasses that provide default codes.
 */
export type SpecializedErrorDetails = Omit<ZeroFTPErrorDetails, "code"> & {
  /** Optional override for the subclass default code. */
  code?: string;
};

/**
 * Base class for all typed ZeroFTP errors.
 */
export class ZeroFTPError extends Error {
  /** Stable machine-readable error code. */
  readonly code: string;
  /** Protocol active when the error occurred. */
  readonly protocol?: RemoteProtocol;
  /** Remote host associated with the failing operation. */
  readonly host?: string;
  /** Protocol command associated with the failure, if any. */
  readonly command?: string;
  /** FTP response code associated with the failure. */
  readonly ftpCode?: number;
  /** SFTP status code associated with the failure. */
  readonly sftpCode?: number;
  /** Remote path associated with the failure. */
  readonly path?: string;
  /** Whether retry policy may safely retry this failure. */
  readonly retryable: boolean;
  /** Additional structured details for diagnostics. */
  readonly details?: Record<string, unknown>;

  /**
   * Creates a structured SDK error.
   *
   * @param details - Code, message, retryability, and optional protocol context.
   */
  constructor(details: ZeroFTPErrorDetails) {
    super(details.message, details.cause === undefined ? undefined : { cause: details.cause });
    this.name = new.target.name;
    this.code = details.code;
    this.retryable = details.retryable;

    if (details.protocol !== undefined) this.protocol = details.protocol;
    if (details.host !== undefined) this.host = details.host;
    if (details.command !== undefined) this.command = details.command;
    if (details.ftpCode !== undefined) this.ftpCode = details.ftpCode;
    if (details.sftpCode !== undefined) this.sftpCode = details.sftpCode;
    if (details.path !== undefined) this.path = details.path;
    if (details.details !== undefined) this.details = details.details;
  }

  /**
   * Serializes the error into a plain object suitable for logs or API responses.
   *
   * @returns A JSON-safe object containing public structured error fields.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      protocol: this.protocol,
      host: this.host,
      command: this.command,
      ftpCode: this.ftpCode,
      sftpCode: this.sftpCode,
      path: this.path,
      retryable: this.retryable,
      details: this.details,
    };
  }
}

/**
 * Applies a subclass default code while preserving caller overrides.
 *
 * @param details - Subclass error details with optional code override.
 * @param code - Default code for the specific subclass.
 * @returns Complete base error details.
 */
function withDefaultCode(details: SpecializedErrorDetails, code: string): ZeroFTPErrorDetails {
  return {
    ...details,
    code: details.code ?? code,
  };
}

/** Error raised when a remote connection cannot be opened or is lost unexpectedly. */
export class ConnectionError extends ZeroFTPError {
  /**
   * Creates a connection failure.
   *
   * @param details - Error context with optional host, protocol, and retryability details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_CONNECTION_ERROR"));
  }
}

/** Error raised when authentication credentials are rejected. */
export class AuthenticationError extends ZeroFTPError {
  /**
   * Creates an authentication failure.
   *
   * @param details - Error context with optional host, protocol, and command details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_AUTHENTICATION_ERROR"));
  }
}

/** Error raised when authenticated credentials are not authorized for an operation. */
export class AuthorizationError extends ZeroFTPError {
  /**
   * Creates an authorization failure.
   *
   * @param details - Error context with optional path and protocol details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_AUTHORIZATION_ERROR"));
  }
}

/** Error raised when a requested remote path does not exist. */
export class PathNotFoundError extends ZeroFTPError {
  /**
   * Creates a missing-path failure.
   *
   * @param details - Error context with optional path and protocol details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_PATH_NOT_FOUND"));
  }
}

/** Error raised when a create or rename operation targets an existing path. */
export class PathAlreadyExistsError extends ZeroFTPError {
  /**
   * Creates an already-exists failure.
   *
   * @param details - Error context with optional path and command details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_PATH_ALREADY_EXISTS"));
  }
}

/** Error raised when the remote server denies access to a path or command. */
export class PermissionDeniedError extends ZeroFTPError {
  /**
   * Creates a permission failure.
   *
   * @param details - Error context with optional path, command, and protocol details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_PERMISSION_DENIED"));
  }
}

/** Error raised when an operation exceeds its configured timeout. */
export class TimeoutError extends ZeroFTPError {
  /**
   * Creates a timeout failure.
   *
   * @param details - Error context with optional duration and retryability details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_TIMEOUT"));
  }
}

/** Error raised when an operation is cancelled by an AbortSignal or caller action. */
export class AbortError extends ZeroFTPError {
  /**
   * Creates an aborted-operation failure.
   *
   * @param details - Error context with optional operation and path details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_ABORTED"));
  }
}

/** Error raised when a server response violates protocol expectations. */
export class ProtocolError extends ZeroFTPError {
  /**
   * Creates a protocol failure.
   *
   * @param details - Error context with optional response code and command details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_PROTOCOL_ERROR"));
  }
}

/** Error raised when protocol text or metadata cannot be parsed safely. */
export class ParseError extends ZeroFTPError {
  /**
   * Creates a parser failure.
   *
   * @param details - Error context with malformed input details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_PARSE_ERROR"));
  }
}

/** Error raised when an upload, download, or stream transfer fails. */
export class TransferError extends ZeroFTPError {
  /**
   * Creates a transfer failure.
   *
   * @param details - Error context with optional path, bytes, and retryability details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_TRANSFER_ERROR"));
  }
}

/** Error raised when post-transfer verification fails. */
export class VerificationError extends ZeroFTPError {
  /**
   * Creates a verification failure.
   *
   * @param details - Error context with checksum, size, or timestamp mismatch details.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_VERIFICATION_ERROR"));
  }
}

/** Error raised when a requested protocol feature is not implemented or unavailable. */
export class UnsupportedFeatureError extends ZeroFTPError {
  /**
   * Creates an unsupported-feature failure.
   *
   * @param details - Error context describing the missing feature or adapter.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_UNSUPPORTED_FEATURE"));
  }
}

/** Error raised when user-provided options or paths are invalid before network I/O. */
export class ConfigurationError extends ZeroFTPError {
  /**
   * Creates a configuration failure.
   *
   * @param details - Error context describing the invalid option or argument.
   */
  constructor(details: SpecializedErrorDetails) {
    super(withDefaultCode(details, "ZERO_FTP_CONFIGURATION_ERROR"));
  }
}
