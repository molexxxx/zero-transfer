import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConnectionError,
  PathAlreadyExistsError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  TransferError,
} from "../../../src/errors/ZeroTransferError";
import { errorFromFtpReply } from "../../../src/errors/errorFactory";

describe("errorFromFtpReply", () => {
  it("maps common FTP status codes into typed errors", () => {
    expect(errorFromFtpReply({ ftpCode: 530, message: "Login incorrect" })).toBeInstanceOf(
      AuthenticationError,
    );
    expect(errorFromFtpReply({ ftpCode: 421, message: "Service unavailable" })).toBeInstanceOf(
      ConnectionError,
    );
    expect(errorFromFtpReply({ ftpCode: 450, message: "Busy" })).toBeInstanceOf(TransferError);
    expect(
      errorFromFtpReply({ ftpCode: 425, message: "Cannot open data connection" }),
    ).toBeInstanceOf(ConnectionError);
    expect(errorFromFtpReply({ ftpCode: 500, message: "Syntax error" })).toBeInstanceOf(
      ProtocolError,
    );
  });

  it("preserves command, path, protocol, cause, and retryability context", () => {
    const cause = new Error("socket timeout");
    const error = errorFromFtpReply({
      cause,
      command: "RETR missing.txt",
      ftpCode: 421,
      message: "Service unavailable",
      path: "/missing.txt",
      protocol: "ftps",
    });

    expect(error).toMatchObject({
      cause,
      command: "RETR missing.txt",
      path: "/missing.txt",
      protocol: "ftps",
      retryable: true,
    });
  });

  it("maps FTP 550 based on the server message", () => {
    expect(errorFromFtpReply({ ftpCode: 550, message: "File already exists" })).toBeInstanceOf(
      PathAlreadyExistsError,
    );
    expect(errorFromFtpReply({ ftpCode: 550, message: "No such file" })).toBeInstanceOf(
      PathNotFoundError,
    );
    expect(errorFromFtpReply({ ftpCode: 550, message: "Permission denied" })).toBeInstanceOf(
      PermissionDeniedError,
    );
  });
});
