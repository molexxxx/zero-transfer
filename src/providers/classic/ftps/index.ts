/**
 * Classic FTPS provider exports.
 *
 * This module gives FTPS callers a protocol-specific import path while reusing
 * the shared classic FTP/FTPS implementation exported from `providers/classic/ftp`.
 *
 * @module providers/classic/ftps
 */
export {
  createFtpsProviderFactory,
  type FtpPassiveHostStrategy,
  type FtpsDataProtection,
  type FtpsMode,
  type FtpsProviderOptions,
} from "../ftp";
