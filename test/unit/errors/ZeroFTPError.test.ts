import { describe, expect, it } from "vitest";
import {
  AbortError,
  AuthenticationError,
  AuthorizationError,
  ConfigurationError,
  ConnectionError,
  ParseError,
  PathAlreadyExistsError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  TimeoutError,
  TransferError,
  UnsupportedFeatureError,
  VerificationError,
  ZeroFTPError,
  type SpecializedErrorDetails,
} from "../../../src/errors/ZeroFTPError";

describe("ZeroFTPError", () => {
  it("stores structured error context and serializes safely", () => {
    const cause = new Error("socket closed");
    const error = new ZeroFTPError({
      cause,
      code: "CUSTOM",
      command: "RETR file.txt",
      details: { attempt: 2 },
      ftpCode: 421,
      host: "ftp.example.com",
      message: "Connection dropped",
      path: "/file.txt",
      protocol: "ftp",
      retryable: true,
      sftpCode: 4,
    });

    expect(error.cause).toBe(cause);
    expect(error.toJSON()).toMatchObject({
      code: "CUSTOM",
      command: "RETR file.txt",
      details: { attempt: 2 },
      ftpCode: 421,
      host: "ftp.example.com",
      name: "ZeroFTPError",
      path: "/file.txt",
      protocol: "ftp",
      retryable: true,
      sftpCode: 4,
    });
  });

  it("assigns stable default codes for specialized errors", () => {
    const baseDetails: SpecializedErrorDetails = {
      message: "boom",
      retryable: false,
    };
    const specializedErrors = [
      new ConnectionError(baseDetails),
      new AuthenticationError(baseDetails),
      new AuthorizationError(baseDetails),
      new PathNotFoundError(baseDetails),
      new PathAlreadyExistsError(baseDetails),
      new PermissionDeniedError(baseDetails),
      new TimeoutError(baseDetails),
      new AbortError(baseDetails),
      new ProtocolError(baseDetails),
      new ParseError(baseDetails),
      new TransferError(baseDetails),
      new VerificationError(baseDetails),
      new UnsupportedFeatureError(baseDetails),
      new ConfigurationError(baseDetails),
    ];

    expect(specializedErrors.map((error) => error.code)).toEqual([
      "ZERO_FTP_CONNECTION_ERROR",
      "ZERO_FTP_AUTHENTICATION_ERROR",
      "ZERO_FTP_AUTHORIZATION_ERROR",
      "ZERO_FTP_PATH_NOT_FOUND",
      "ZERO_FTP_PATH_ALREADY_EXISTS",
      "ZERO_FTP_PERMISSION_DENIED",
      "ZERO_FTP_TIMEOUT",
      "ZERO_FTP_ABORTED",
      "ZERO_FTP_PROTOCOL_ERROR",
      "ZERO_FTP_PARSE_ERROR",
      "ZERO_FTP_TRANSFER_ERROR",
      "ZERO_FTP_VERIFICATION_ERROR",
      "ZERO_FTP_UNSUPPORTED_FEATURE",
      "ZERO_FTP_CONFIGURATION_ERROR",
    ]);
    expect(specializedErrors.every((error) => error.name.endsWith("Error"))).toBe(true);
  });
});
