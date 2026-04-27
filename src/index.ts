/**
 * ZeroFTP public API surface.
 *
 * This barrel exports the alpha foundation: the client facade, shared public types,
 * typed errors, parser utilities, logging helpers, transfer helpers, and path safety
 * utilities used by future protocol adapters.
 *
 * @module zero-ftp
 */
export { ZeroFTP, type ZeroFTPCapabilities, type ZeroFTPOptions } from "./client/ZeroFTP";
export { errorFromFtpReply, type FtpReplyErrorInput } from "./errors/errorFactory";
export {
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
  type ZeroFTPErrorDetails,
} from "./errors/ZeroFTPError";
export {
  emitLog,
  noopLogger,
  type LogLevel,
  type LogRecord,
  type LoggerMethod,
  type LogRecordInput,
  type ZeroFTPLogger,
} from "./logging/Logger";
export {
  REDACTED,
  isSensitiveKey,
  redactCommand,
  redactObject,
  redactValue,
} from "./logging/redaction";
export type { RemoteFileAdapter } from "./protocols/RemoteFileAdapter";
export { parseFtpFeatures, type FtpFeatures } from "./protocols/ftp/FtpFeatureParser";
export { parseMlsdLine, parseMlsdList, parseMlstTimestamp } from "./protocols/ftp/FtpListParser";
export {
  FtpResponseParser,
  parseFtpResponseLines,
  type FtpResponse,
  type FtpResponseStatus,
} from "./protocols/ftp/FtpResponseParser";
export {
  createProgressEvent,
  createTransferResult,
  type ProgressEventInput,
  type TransferResultInput,
} from "./services/TransferService";
export type {
  ConnectionProfile,
  ListOptions,
  RemoteEntry,
  RemoteEntryType,
  RemotePermissions,
  RemoteProtocol,
  RemoteStat,
  StatOptions,
  TransferProgressEvent,
  TransferResult,
} from "./types/public";
export {
  assertSafeFtpArgument,
  basenameRemotePath,
  joinRemotePath,
  normalizeRemotePath,
} from "./utils/path";
