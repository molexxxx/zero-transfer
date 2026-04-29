/**
 * @zero-transfer/ftps entry point.
 *
 * Explicit and implicit FTPS with full TLS profile support.
 * Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/ftps
 */
export * from "./core";
export {
  createFtpsProviderFactory,
  type FtpsDataProtection,
  type FtpsMode,
  type FtpsProviderOptions,
} from "../providers/classic/ftps";
