/**
 * @zero-transfer/sftp entry point.
 *
 * SFTP over SSH with two backends:
 *
 * - **Native** ({@link createNativeSftpProviderFactory}): a zero-dependency
 *   SSH/SFTP stack with Ed25519 / RSA / ECDSA host keys, password /
 *   keyboard-interactive / public-key auth, host-key pinning and OpenSSH
 *   `known_hosts`, handshake timeout, and idle keepalive.
 * - **Classic** ({@link createSftpProviderFactory}): the legacy `ssh2`-backed
 *   provider with ssh-agent and a first-class jump-host helper.
 *
 * Includes the complete `@zero-transfer/core` surface.
 *
 * Runtime dependency: `ssh2` (for the classic provider only — the native
 * provider has no runtime dependencies).
 *
 * @module @zero-transfer/sftp
 */
export * from "./core";
export {
  createNativeSftpProviderFactory,
  type NativeSftpProviderOptions,
  type NativeSftpRawSession,
} from "../providers/native/sftp";
export {
  createSftpProviderFactory,
  createSftpJumpHostSocketFactory,
  type SftpJumpHostOptions,
  type SftpProviderOptions,
  type SftpRawSession,
} from "../providers/classic/sftp";
