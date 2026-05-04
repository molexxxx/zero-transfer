/**
 * SFTP v3 status codes (draft-ietf-secsh-filexfer-02 §7) and their mapping
 * to typed SDK errors.
 */
import {
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  UnsupportedFeatureError,
  ZeroTransferError,
} from "../../../errors/ZeroTransferError";
import { SshDataReader } from "../../ssh/binary/SshDataReader";

// -- Status code constants -----------------------------------------------------

export const SFTP_STATUS = {
  OK: 0,
  EOF: 1,
  NO_SUCH_FILE: 2,
  PERMISSION_DENIED: 3,
  FAILURE: 4,
  BAD_MESSAGE: 5,
  NO_CONNECTION: 6,
  CONNECTION_LOST: 7,
  OP_UNSUPPORTED: 8,
} as const;

export type SftpStatusCode = (typeof SFTP_STATUS)[keyof typeof SFTP_STATUS];

// -- Status response decoder ---------------------------------------------------

export interface SftpStatusResponse {
  requestId: number;
  statusCode: number;
  errorMessage: string;
  languageTag: string;
}

/**
 * Decodes an SSH_FXP_STATUS payload (type byte already consumed).
 */
export function decodeSftpStatusPayload(payload: Uint8Array): SftpStatusResponse {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const statusCode = reader.readUint32();
  const errorMessage = reader.hasMore() ? reader.readString().toString("utf8") : "";
  const languageTag = reader.hasMore() ? reader.readString().toString("ascii") : "";
  return { errorMessage, languageTag, requestId, statusCode };
}

// -- Status-to-error mapping ---------------------------------------------------

/**
 * Converts an SFTP status code into the appropriate SDK error type.
 * Returns `null` for `SSH_FX_OK` (caller should handle success inline).
 * Returns `null` for `SSH_FX_EOF` (caller should handle as end-of-data).
 */
export function sftpStatusToError(status: SftpStatusResponse, path?: string): Error | null {
  switch (status.statusCode) {
    case SFTP_STATUS.OK:
      return null;
    case SFTP_STATUS.EOF:
      return null; // not an error: caller checks for EOF explicitly

    case SFTP_STATUS.NO_SUCH_FILE:
      return new PathNotFoundError({
        details: { path, sftpMessage: status.errorMessage },
        message: `SFTP: no such file or directory${path !== undefined ? ` — ${path}` : ""}`,
        protocol: "sftp",
        retryable: false,
      });

    case SFTP_STATUS.PERMISSION_DENIED:
      return new PermissionDeniedError({
        details: { path, sftpMessage: status.errorMessage },
        message: `SFTP: permission denied${path !== undefined ? ` — ${path}` : ""}`,
        protocol: "sftp",
        retryable: false,
      });

    case SFTP_STATUS.NO_CONNECTION:
    case SFTP_STATUS.CONNECTION_LOST:
      return new ConnectionError({
        details: { sftpMessage: status.errorMessage, statusCode: status.statusCode },
        message: `SFTP: connection error — ${status.errorMessage}`,
        protocol: "sftp",
        retryable: true,
      });

    case SFTP_STATUS.OP_UNSUPPORTED:
      return new UnsupportedFeatureError({
        details: { sftpMessage: status.errorMessage },
        message: `SFTP: operation unsupported — ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false,
      });

    case SFTP_STATUS.BAD_MESSAGE:
      return new ProtocolError({
        details: { sftpMessage: status.errorMessage },
        message: `SFTP: bad message — ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false,
      });

    default:
      return new ZeroTransferError({
        code: "SFTP_FAILURE",
        details: { sftpMessage: status.errorMessage, statusCode: status.statusCode },
        message: `SFTP: operation failed (status ${status.statusCode}) — ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false,
      });
  }
}

/**
 * Throws the appropriate SDK error for a non-OK status payload.
 * Passes through for OK (no-op) but throws for all error codes including EOF.
 */
export function throwIfSftpError(status: SftpStatusResponse, path?: string): void {
  if (status.statusCode === SFTP_STATUS.OK) return;
  const err = sftpStatusToError(status, path);
  if (err !== null) throw err;
  // EOF reached here — treat as an unexpected-EOF protocol error.
  throw new ProtocolError({
    message: "SFTP: unexpected SSH_FX_EOF in non-data response",
    protocol: "sftp",
    retryable: false,
  });
}
