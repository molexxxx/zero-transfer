/**
 * ZeroTransfer public API surface.
 *
 * This barrel exports the alpha foundation: the transfer facade, shared public
 * types, typed errors, parser utilities, logging helpers, transfer helpers, and
 * path safety utilities used by future protocol adapters.
 *
 * @module @zero-transfer/sdk
 */
import { ZeroFTP } from "./client/ZeroFTP";
import type { ZeroFTPCapabilities, ZeroFTPOptions } from "./client/ZeroFTP";
import { createTransferClient } from "./core/createTransferClient";

export { ZeroFTP, type ZeroFTPCapabilities, type ZeroFTPOptions } from "./client/ZeroFTP";
export {
  CLASSIC_PROVIDER_IDS,
  isClassicProviderId,
  resolveProviderId,
  type BuiltInProviderId,
  type ClassicProviderId,
  type ProviderId,
  type ProviderSelection,
} from "./core/ProviderId";
export type {
  AuthenticationCapability,
  CapabilitySet,
  ChecksumCapability,
  MetadataCapability,
} from "./core/CapabilitySet";
export { ProviderRegistry } from "./core/ProviderRegistry";
export { TransferClient, type TransferClientOptions } from "./core/TransferClient";
export type { TransferSession } from "./core/TransferSession";
export { createTransferClient } from "./core/createTransferClient";
export type { TransferProvider } from "./providers/Provider";
export type {
  AuthenticationCapability as ProviderAuthenticationCapability,
  ChecksumCapability as ProviderChecksumCapability,
  MetadataCapability as ProviderMetadataCapability,
  ProviderCapabilities,
} from "./providers/ProviderCapabilities";
export type { ProviderFactory } from "./providers/ProviderFactory";
export type { RemoteFileSystem } from "./providers/RemoteFileSystem";
export { createLocalProviderFactory, type LocalProviderOptions } from "./providers/local";
export {
  createMemoryProviderFactory,
  type MemoryProviderEntry,
  type MemoryProviderOptions,
} from "./providers/memory";
export {
  redactConnectionProfile,
  redactSecretSource,
  resolveConnectionProfileSecrets,
  resolveSecret,
  validateConnectionProfile,
  type Base64EnvSecretSource,
  type EnvSecretSource,
  type FileSecretSource,
  type ResolveSecretOptions,
  type ResolvedConnectionProfile,
  type SecretProvider,
  type SecretSource,
  type SecretValue,
  type ValueSecretSource,
} from "./profiles";
/** Preferred high-level SDK facade for new ZeroTransfer code. */
export const ZeroTransfer = Object.assign(ZeroFTP, { createTransferClient });
/** Preferred options type for the ZeroTransfer facade. */
export type ZeroTransferOptions = ZeroFTPOptions;
/** Preferred capability snapshot type for the ZeroTransfer facade. */
export type ZeroTransferCapabilities = ZeroFTPCapabilities;
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
