/**
 * @zero-transfer/sftp entry point.
 *
 * Zero-dependency SFTP over SSH built on a first-party SSH transport stack.
 *
 * The provider implements RFC 4253 transport (curve25519-sha256 KEX, AES-CTR,
 * HMAC-SHA2), host-key verification for Ed25519 / RSA-SHA2-256/512 / ECDSA
 * P-256/384/521, host-key pinning, OpenSSH `known_hosts`, password /
 * keyboard-interactive / public-key (Ed25519 + RSA) authentication, handshake
 * timeout, and idle NAT keepalive — all without any third-party SSH library.
 *
 * Includes the complete `@zero-transfer/core` surface.
 *
 * `createSftpProviderFactory`, `SftpProviderOptions`, and `SftpRawSession`
 * are kept as aliases of the native names for backward compatibility.
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
  type SftpProviderOptions,
  type SftpRawSession,
} from "../providers/classic/sftp";
export {
  matchKnownHosts,
  matchKnownHostsEntry,
  parseKnownHosts,
  type KnownHostsEntry,
  type KnownHostsMarker,
} from "../profiles/importers/KnownHostsParser";
