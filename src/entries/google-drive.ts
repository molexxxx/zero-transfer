/**
 * @zero-transfer/google-drive entry point.
 *
 * Google Drive provider with OAuth bearer tokens, ranged downloads, and
 * md5Checksum verification. Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/google-drive
 */
export * from "./core";
export {
  createGoogleDriveProviderFactory,
  type GoogleDriveProviderOptions,
} from "../providers/cloud/GoogleDriveProvider";
