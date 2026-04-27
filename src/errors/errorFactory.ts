/**
 * Protocol error factory helpers.
 *
 * This module translates raw FTP status replies into typed ZeroTransfer errors so
 * adapters can keep protocol parsing separate from application-facing failures.
 *
 * @module errors/errorFactory
 */
import {
  AuthenticationError,
  ConnectionError,
  PathAlreadyExistsError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  TransferError,
  type SpecializedErrorDetails,
  type ZeroTransferError,
} from "./ZeroTransferError";
import type { RemoteProtocol } from "../types/public";

/**
 * Input used to map an FTP reply into a structured ZeroTransfer error.
 */
export interface FtpReplyErrorInput {
  /** Numeric FTP response code returned by the server. */
  ftpCode: number;
  /** Server-provided response message. */
  message: string;
  /** FTP command that produced the response, if known. */
  command?: string;
  /** Remote path involved in the command, if any. */
  path?: string;
  /** Protocol variant used by the adapter. */
  protocol?: RemoteProtocol;
  /** Original lower-level failure that accompanied the reply. */
  cause?: unknown;
}

/**
 * Maps an FTP reply into the closest typed ZeroTransfer error.
 *
 * @param input - FTP code, message, and optional operation context.
 * @returns A structured error subclass with stable code and retryability metadata.
 */
export function errorFromFtpReply(input: FtpReplyErrorInput): ZeroTransferError {
  const details: SpecializedErrorDetails = {
    ftpCode: input.ftpCode,
    message: input.message,
    protocol: input.protocol ?? "ftp",
    retryable: false,
  };

  if (input.command !== undefined) details.command = input.command;
  if (input.path !== undefined) details.path = input.path;
  if (input.cause !== undefined) details.cause = input.cause;

  if (input.ftpCode === 530) {
    return new AuthenticationError(details);
  }

  if (input.ftpCode === 421) {
    return new ConnectionError({
      ...details,
      retryable: true,
    });
  }

  if (input.ftpCode === 550) {
    return mapFtp550(details);
  }

  if ([450, 451, 452].includes(input.ftpCode)) {
    return new TransferError({
      ...details,
      retryable: true,
    });
  }

  if (input.ftpCode >= 400 && input.ftpCode < 500) {
    return new ConnectionError({
      ...details,
      retryable: true,
    });
  }

  return new ProtocolError(details);
}

/**
 * Maps ambiguous FTP 550 replies to the most specific path or permission error.
 *
 * @param details - Shared error details derived from the original reply.
 * @returns A typed path or permission error.
 */
function mapFtp550(details: SpecializedErrorDetails): ZeroTransferError {
  const lowerMessage = details.message.toLowerCase();

  if (lowerMessage.includes("already") || lowerMessage.includes("exists")) {
    return new PathAlreadyExistsError(details);
  }

  if (
    lowerMessage.includes("not found") ||
    lowerMessage.includes("no such") ||
    lowerMessage.includes("unavailable")
  ) {
    return new PathNotFoundError(details);
  }

  return new PermissionDeniedError(details);
}
