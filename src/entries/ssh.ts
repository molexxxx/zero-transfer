/**
 * @zero-transfer/ssh entry point.
 *
 * Zero-dependency, RFC-compliant SSH transport, user-authentication, and
 * connection-protocol primitives extracted from the SFTP provider. The same
 * stack that powers `@zero-transfer/sftp` is exposed here for callers that
 * need direct access to SSH features that are not strictly file transfer:
 *
 * - Building custom subsystem clients (e.g. NETCONF, custom RPC channels)
 * - Running remote commands via `exec` channels
 * - Implementing tunneling / port-forwarding on top of `SshSessionChannel`
 * - Parsing OpenSSH `known_hosts` and verifying host keys outside of SFTP
 * - Parsing OpenSSH-format private keys and producing publickey credentials
 *
 * Because the Node.js ecosystem lacks a maintained pure-JS SSH library,
 * this scope ships the protocol stack as a standalone module.
 *
 * **Scope:** RFC 4253 (transport), RFC 4252 (userauth), RFC 4254 (connection),
 * RFC 5656 (ECDSA host keys), curve25519-sha256 KEX, AES-CTR + HMAC-SHA2.
 *
 * Includes the complete `@zero-transfer/core` surface.
 *
 * @example Open a custom subsystem
 * ```ts
 * import { createConnection } from "node:net";
 * import {
 *   SshTransportConnection,
 *   SshAuthSession,
 *   SshConnectionManager,
 * } from "@zero-transfer/ssh";
 *
 * const socket = createConnection({ host: "example.com", port: 22 });
 * const transport = new SshTransportConnection({ handshakeTimeoutMs: 10_000 });
 * await transport.connect(socket);
 *
 * const auth = new SshAuthSession(transport);
 * await auth.authenticate({
 *   type: "password",
 *   username: "deploy",
 *   password: process.env.SSH_PASSWORD!,
 * });
 *
 * const conn = new SshConnectionManager(transport);
 * const channel = await conn.openSubsystemChannel("netconf");
 * // ...drive the channel with channel.sendData / channel.dataPayloads()
 * ```
 *
 * @module @zero-transfer/ssh
 */
export * from "./core";

// -- Transport ----------------------------------------------------------------
export {
  SshTransportConnection,
  SshDisconnectReason,
  type SshTransportConnectionOptions,
} from "../protocols/ssh/transport/SshTransportConnection";
export { SshTransportHandshake } from "../protocols/ssh/transport/SshTransportHandshake";
export type { SshTransportHandshakeResult } from "../protocols/ssh/transport/SshTransportHandshake";
export {
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  negotiateSshAlgorithms,
  type NegotiatedSshAlgorithms,
  type SshAlgorithmPreferences,
} from "../protocols/ssh/transport/SshAlgorithmNegotiation";

// -- Authentication -----------------------------------------------------------
export {
  SshAuthSession,
  type SshPasswordCredential,
  type SshPublickeyCredential,
  type SshKeyboardInteractiveCredential,
} from "../protocols/ssh/auth/SshAuthSession";
export { buildPublickeyCredential } from "../protocols/ssh/auth/SshPublickeyCredentialBuilder";

// -- Connection protocol (channels) ------------------------------------------
export { SshConnectionManager } from "../protocols/ssh/connection/SshConnectionManager";
export { SshSessionChannel } from "../protocols/ssh/connection/SshSessionChannel";

// -- Binary primitives --------------------------------------------------------
export { SshDataReader } from "../protocols/ssh/binary/SshDataReader";
export { SshDataWriter } from "../protocols/ssh/binary/SshDataWriter";

// -- Known-hosts utilities ----------------------------------------------------
export {
  matchKnownHosts,
  matchKnownHostsEntry,
  parseKnownHosts,
  type KnownHostsEntry,
  type KnownHostsMarker,
} from "../profiles/importers/KnownHostsParser";
