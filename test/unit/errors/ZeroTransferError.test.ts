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
  ZeroTransferError,
  type SpecializedErrorDetails,
} from "../../../src/errors/ZeroTransferError";

describe("ZeroTransferError", () => {
  it("stores structured error context and serializes safely", () => {
    const cause = new Error("socket closed");
    const error = new ZeroTransferError({
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
      name: "ZeroTransferError",
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
      "ZERO_TRANSFER_CONNECTION_ERROR",
      "ZERO_TRANSFER_AUTHENTICATION_ERROR",
      "ZERO_TRANSFER_AUTHORIZATION_ERROR",
      "ZERO_TRANSFER_PATH_NOT_FOUND",
      "ZERO_TRANSFER_PATH_ALREADY_EXISTS",
      "ZERO_TRANSFER_PERMISSION_DENIED",
      "ZERO_TRANSFER_TIMEOUT",
      "ZERO_TRANSFER_ABORTED",
      "ZERO_TRANSFER_PROTOCOL_ERROR",
      "ZERO_TRANSFER_PARSE_ERROR",
      "ZERO_TRANSFER_TRANSFER_ERROR",
      "ZERO_TRANSFER_VERIFICATION_ERROR",
      "ZERO_TRANSFER_UNSUPPORTED_FEATURE",
      "ZERO_TRANSFER_CONFIGURATION_ERROR",
    ]);
    expect(specializedErrors.every((error) => error.name.endsWith("Error"))).toBe(true);
  });

  it("keeps the ZeroFTPError export as a compatibility alias", () => {
    const error = new ConnectionError({ message: "boom", retryable: true });

    expect(ZeroFTPError).toBe(ZeroTransferError);
    expect(error).toBeInstanceOf(ZeroTransferError);
    expect(error).toBeInstanceOf(ZeroFTPError);
  });
});
