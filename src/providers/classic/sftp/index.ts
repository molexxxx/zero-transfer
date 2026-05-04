/**
 * Legacy SFTP provider entry point.
 *
 * The original `ssh2`-backed implementation has been replaced by the
 * zero-dependency native SSH/SFTP stack under `providers/native/sftp`.
 * This shim re-exports the native factory under the historical names
 * (`createSftpProviderFactory`, `SftpProviderOptions`, `SftpRawSession`)
 * so existing callers keep working.
 *
 * @module providers/classic/sftp
 */
export {
  createNativeSftpProviderFactory as createSftpProviderFactory,
  type NativeSftpProviderOptions as SftpProviderOptions,
  type NativeSftpRawSession as SftpRawSession,
} from "../../native/sftp";
