/**
 * @zero-transfer/sftp entry point.
 *
 * SFTP over SSH with key auth, known_hosts parsing, and jump-host support.
 * Includes the complete @zero-transfer/core surface.
 * Runtime dependency: ssh2
 *
 * @module @zero-transfer/sftp
 */
export * from "./core";
export {
  createSftpProviderFactory,
  createSftpJumpHostSocketFactory,
  type SftpJumpHostOptions,
  type SftpProviderOptions,
  type SftpRawSession,
} from "../providers/classic/sftp";
