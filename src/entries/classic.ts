/**
 * @zero-transfer/classic entry point.
 *
 * FTP, FTPS, and SFTP providers in one install.
 * Includes the complete @zero-transfer/core surface.
 * Zero runtime dependencies (SFTP uses the native SSH stack).
 *
 * @module @zero-transfer/classic
 */
export * from "./core";
export {
  createFtpProviderFactory,
  createFtpsProviderFactory,
  FtpResponseParser,
  parseFtpFeatures,
  parseFtpResponseLines,
  parseMlsdLine,
  parseMlsdList,
  parseMlstTimestamp,
  parseUnixList,
  parseUnixListLine,
  type FtpPassiveHostStrategy,
  type FtpFeatures,
  type FtpProviderOptions,
  type FtpsDataProtection,
  type FtpsMode,
  type FtpsProviderOptions,
  type FtpResponse,
  type FtpResponseStatus,
} from "../providers/classic/ftp";
export {
  createSftpProviderFactory,
  type SftpProviderOptions,
  type SftpRawSession,
} from "../providers/classic/sftp";
