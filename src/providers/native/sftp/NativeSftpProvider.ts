/**
 * Native SSH/SFTP provider — uses the project's own SSH/SFTP protocol stack
 * (Waves 1-3) instead of the `ssh2` third-party library.
 *
 * Supported auth methods: password, keyboard-interactive.
 * (Public-key auth requires Wave 5+ native key-parsing support; use the
 *  ssh2-backed `createSftpProviderFactory` in the meantime.)
 *
 * @module providers/native/sftp/NativeSftpProvider
 */
import { Buffer } from "node:buffer";
import { createHash, createPrivateKey } from "node:crypto";
import { createConnection } from "node:net";
import type { Socket } from "node:net";
import {
  AbortError,
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  TimeoutError,
  ZeroTransferError,
} from "../../../errors/ZeroTransferError";
import type { CapabilitySet } from "../../../core/CapabilitySet";
import type { TransferSession } from "../../../core/TransferSession";
import {
  resolveConnectionProfileSecrets,
  type ResolvedConnectionProfile,
} from "../../../profiles/resolveConnectionProfileSecrets";
import type { SecretValue } from "../../../profiles/SecretSource";
import {
  type KnownHostsEntry,
  matchKnownHostsEntry,
  parseKnownHosts,
} from "../../../profiles/importers/KnownHostsParser";
import type { TransferVerificationResult } from "../../../transfers/TransferJob";
import type {
  ConnectionProfile,
  ListOptions,
  MkdirOptions,
  RemoteEntry,
  RemoteEntryType,
  RemoteStat,
  RemoveOptions,
  RenameOptions,
  RmdirOptions,
  StatOptions,
} from "../../../types/public";
import { basenameRemotePath, joinRemotePath, normalizeRemotePath } from "../../../utils/path";
import type { TransferProvider } from "../../Provider";
import type { ProviderFactory } from "../../ProviderFactory";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../../ProviderTransferOperations";
import type { RemoteFileSystem } from "../../RemoteFileSystem";
import {
  type SshKeyboardInteractiveCredential,
  type SshPasswordCredential,
  type SshPublickeyCredential,
  SshAuthSession,
} from "../../../protocols/ssh/auth/SshAuthSession";
import { buildPublickeyCredential } from "../../../protocols/ssh/auth/SshPublickeyCredentialBuilder";
import { SshConnectionManager } from "../../../protocols/ssh/connection/SshConnectionManager";
import { SshTransportConnection } from "../../../protocols/ssh/transport/SshTransportConnection";
import type { SshAlgorithmPreferences } from "../../../protocols/ssh/transport/SshAlgorithmNegotiation";
import {
  SFTP_OPEN_FLAG,
  type SftpFileAttributes,
  type SftpNameEntry,
  SftpSession,
} from "../../../protocols/sftp/v3/SftpSession";

// -- Constants -----------------------------------------------------------------

const NATIVE_SFTP_PROVIDER_ID = "sftp-native";
const NATIVE_SFTP_DEFAULT_PORT = 22;

/** SFTP read chunk size — stay within a single SSH channel max-packet. */
const SFTP_READ_CHUNK_BYTES = 32_768;

/**
 * Algorithm preferences limited to what the native transport actually implements:
 * AES-CTR encryption + HMAC-SHA2 MACs. chacha20-poly1305 and AES-GCM are NOT
 * currently supported so we must not advertise them.
 */
const NATIVE_SFTP_ALGORITHM_PREFERENCES: SshAlgorithmPreferences = {
  compressionClientToServer: ["none"],
  compressionServerToClient: ["none"],
  encryptionClientToServer: ["aes256-ctr", "aes128-ctr"],
  encryptionServerToClient: ["aes256-ctr", "aes128-ctr"],
  kexAlgorithms: ["curve25519-sha256", "curve25519-sha256@libssh.org"],
  languagesClientToServer: [],
  languagesServerToClient: [],
  macClientToServer: ["hmac-sha2-256", "hmac-sha2-512"],
  macServerToClient: ["hmac-sha2-256", "hmac-sha2-512"],
  serverHostKeyAlgorithms: [
    "ssh-ed25519",
    "ecdsa-sha2-nistp256",
    "ecdsa-sha2-nistp384",
    "ecdsa-sha2-nistp521",
    "rsa-sha2-512",
    "rsa-sha2-256",
  ],
};

const NATIVE_SFTP_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: NATIVE_SFTP_PROVIDER_ID,
  authentication: ["password", "keyboard-interactive", "publickey"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: true,
  resumeUpload: true,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: ["accessedAt", "group", "modifiedAt", "owner", "permissions"],
  maxConcurrency: 8,
  notes: [
    "Native SSH/SFTP provider using the project's own protocol stack (Waves 1–3).",
    "Supports password and keyboard-interactive authentication.",
  ],
};

// -- Public types --------------------------------------------------------------

/**
 * Options for {@link createNativeSftpProviderFactory}.
 *
 * The native provider is a zero-dependency replacement for the legacy
 * `ssh2`-backed provider. It implements RFC 4253 SSH transport, RFC 4252 user
 * authentication (`password`, `keyboard-interactive`, `publickey` with
 * Ed25519/RSA), RFC 5656 ECDSA host keys (`nistp256/384/521`), and the
 * SFTP v3 client protocol multiplexed over a single channel.
 */
export interface NativeSftpProviderOptions {
  /**
   * Default connection timeout in milliseconds when the profile omits
   * `timeoutMs`. Bounds both the TCP connect *and* the SSH identification +
   * key-exchange handshake, so a hung server cannot stall `connect()`
   * indefinitely after the socket is accepted.
   */
  readyTimeoutMs?: number;
  /**
   * Default interval (milliseconds) between SSH-level keepalive pings sent
   * once the transport is connected and idle. Prevents stateful firewalls /
   * NAT devices from dropping long-lived sessions. The timer is reset on
   * every outbound payload so active transfers do not generate extra
   * traffic. Disabled when omitted or `0`.
   */
  keepaliveIntervalMs?: number;
}

/**
 * Low-level handles exposed by a native SFTP session for diagnostics and
 * advanced extension. Most applications should use the
 * {@link TransferSession} returned from `client.connect()` instead.
 */
export interface NativeSftpRawSession {
  /** SFTP v3 client multiplexed over the SSH session channel. */
  sftp: SftpSession;
  /** Underlying SSH transport (key exchange, packet protection, channel mux). */
  transport: SshTransportConnection;
}

// -- Factory -------------------------------------------------------------------

/**
 * Creates a {@link ProviderFactory} backed by the native SSH/SFTP protocol
 * stack — no `ssh2` dependency required.
 *
 * **Supported algorithms**
 * - Key exchange: `curve25519-sha256`, `curve25519-sha256@libssh.org`
 * - Host keys: `ssh-ed25519`, `ecdsa-sha2-nistp256/384/521`, `rsa-sha2-256`,
 *   `rsa-sha2-512` (legacy SHA-1 `ssh-rsa` is rejected)
 * - Ciphers: `aes128-ctr`, `aes256-ctr`
 * - MACs: `hmac-sha2-256`, `hmac-sha2-512`
 *
 * **Authentication**
 * - `password`
 * - `keyboard-interactive` (RFC 4256)
 * - `publickey` for Ed25519 and RSA private keys (`rsa-sha2-512` preferred,
 *   `rsa-sha2-256` fallback). Encrypted keys are unlocked via
 *   `profile.ssh.passphrase`.
 *
 * **Host-key verification**
 * - The server's signature over the exchange hash is always verified.
 * - Optional pinning via `profile.ssh.pinnedHostKeySha256` (`SHA256:...`,
 *   raw base64, or hex).
 * - Optional `profile.ssh.knownHosts` (OpenSSH format, hashed and plain
 *   patterns, `[host]:port`, negation, and `@revoked` markers).
 *
 * **Resilience**
 * - `readyTimeoutMs` bounds TCP connect + SSH handshake.
 * - `keepaliveIntervalMs` keeps idle sessions alive through stateful
 *   firewalls / NAT.
 *
 * @example
 * ```ts
 * const client = createTransferClient({
 *   providers: [createNativeSftpProviderFactory({
 *     readyTimeoutMs: 10_000,
 *     keepaliveIntervalMs: 30_000,
 *   })],
 * });
 * const session = await client.connect({
 *   provider: "sftp-native",
 *   host: "sftp.example.com",
 *   username: "deploy",
 *   ssh: {
 *     privateKey: { kind: "literal", value: process.env.DEPLOY_KEY! },
 *     pinnedHostKeySha256: "SHA256:abc...",
 *   },
 * });
 * ```
 */
export function createNativeSftpProviderFactory(
  options: NativeSftpProviderOptions = {},
): ProviderFactory {
  validateNativeSftpOptions(options);

  return {
    capabilities: NATIVE_SFTP_PROVIDER_CAPABILITIES,
    create: () => new NativeSftpProvider(options),
    id: NATIVE_SFTP_PROVIDER_ID,
  };
}

// -- Provider ------------------------------------------------------------------

class NativeSftpProvider implements TransferProvider<NativeSftpSession> {
  readonly id = NATIVE_SFTP_PROVIDER_ID;
  readonly capabilities = NATIVE_SFTP_PROVIDER_CAPABILITIES;

  constructor(private readonly options: NativeSftpProviderOptions) {}

  async connect(profile: ConnectionProfile): Promise<NativeSftpSession> {
    const resolved = await resolveConnectionProfileSecrets(profile);
    const username = requireNativeSftpUsername(resolved);
    const credential = buildNativeSftpCredential(resolved, username);

    let socket: Socket | undefined;
    const hostKeyPins = normalizeNativeHostKeyPins(resolved.ssh?.pinnedHostKeySha256);
    const knownHostsEntries = parseNativeKnownHosts(resolved.ssh?.knownHosts);
    const verifyHostKeyHook = buildNativeHostKeyVerifier({
      host: resolved.host,
      port: resolved.port ?? NATIVE_SFTP_DEFAULT_PORT,
      pins: hostKeyPins,
      knownHosts: knownHostsEntries,
    });
    // The same readyTimeoutMs that bounds TCP connect is also used to bound
    // the SSH identification + KEX handshake so a hung server cannot stall
    // the call indefinitely after the socket connects.
    const handshakeTimeoutMs = resolved.timeoutMs ?? this.options.readyTimeoutMs;
    const keepaliveIntervalMs = this.options.keepaliveIntervalMs;
    const baseTransportOptions = {
      algorithms: NATIVE_SFTP_ALGORITHM_PREFERENCES,
      ...(verifyHostKeyHook === undefined ? {} : { verifyHostKey: verifyHostKeyHook }),
      ...(handshakeTimeoutMs === undefined ? {} : { handshakeTimeoutMs }),
      ...(keepaliveIntervalMs === undefined ? {} : { keepaliveIntervalMs }),
    };
    const transportOptions =
      resolved.signal !== undefined
        ? { abortSignal: resolved.signal, ...baseTransportOptions }
        : baseTransportOptions;
    const transport = new SshTransportConnection(transportOptions);

    try {
      socket = await openNativeSftpSocket(resolved, this.options);

      const handshakeResult = await transport.connect(socket);

      const authSession = new SshAuthSession(transport);
      await authSession.authenticate({
        credential,
        sessionId: handshakeResult.keyExchange.sessionId,
      });

      const connectionManager = new SshConnectionManager(transport);
      const channel = await connectionManager.openSubsystemChannel("sftp");
      connectionManager.start().catch(() => {
        // Handled via channel error propagation; ignore here.
      });

      const sftp = new SftpSession(channel);
      await sftp.init();

      return new NativeSftpSession(transport, sftp);
    } catch (error) {
      if (socket !== undefined && !socket.destroyed) {
        socket.destroy();
      }
      throw mapNativeSftpConnectError(error, resolved.host);
    }
  }
}

// -- Session -------------------------------------------------------------------

class NativeSftpSession implements TransferSession<NativeSftpRawSession> {
  readonly provider = NATIVE_SFTP_PROVIDER_ID;
  readonly capabilities = NATIVE_SFTP_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(
    private readonly transport: SshTransportConnection,
    private readonly sftp: SftpSession,
  ) {
    this.fs = new NativeSftpFileSystem(sftp);
    this.transfers = new NativeSftpTransferOperations(sftp);
  }

  disconnect(): Promise<void> {
    this.transport.disconnect();
    return Promise.resolve();
  }

  raw(): NativeSftpRawSession {
    return { sftp: this.sftp, transport: this.transport };
  }
}

// -- Remote file system --------------------------------------------------------

class NativeSftpFileSystem implements RemoteFileSystem {
  constructor(private readonly sftp: SftpSession) {}

  async list(path: string, options: ListOptions = {}): Promise<RemoteEntry[]> {
    nativeSftpThrowIfAborted(options.signal, path, "list");
    const remotePath = normalizeRemotePath(path);

    const entries = await this.sftp.readdirAll(remotePath);

    return entries
      .filter((e) => e.filename !== "." && e.filename !== "..")
      .map((e) => mapNativeSftpEntry(joinRemotePath(remotePath, e.filename), e.filename, e.attrs))
      .sort(compareNativeSftpEntries);
  }

  async stat(path: string, options: StatOptions = {}): Promise<RemoteStat> {
    nativeSftpThrowIfAborted(options.signal, path, "stat");
    const remotePath = normalizeRemotePath(path);

    const attrs = await this.sftp.lstat(remotePath);
    return {
      ...mapNativeSftpEntry(remotePath, basenameRemotePath(remotePath), attrs),
      exists: true,
    };
  }

  async remove(path: string, options: RemoveOptions = {}): Promise<void> {
    nativeSftpThrowIfAborted(options.signal, path, "remove");
    const remotePath = normalizeRemotePath(path);

    try {
      await this.sftp.remove(remotePath);
    } catch (error) {
      if (
        options.ignoreMissing === true &&
        error instanceof ZeroTransferError &&
        error.code === "ZERO_TRANSFER_PATH_NOT_FOUND"
      ) {
        return;
      }
      throw error;
    }
  }

  async rename(from: string, to: string, options: RenameOptions = {}): Promise<void> {
    nativeSftpThrowIfAborted(options.signal, from, "rename");
    const fromPath = normalizeRemotePath(from);
    const toPath = normalizeRemotePath(to);
    await this.sftp.rename(fromPath, toPath);
  }

  async mkdir(path: string, options: MkdirOptions = {}): Promise<void> {
    nativeSftpThrowIfAborted(options.signal, path, "mkdir");
    const remotePath = normalizeRemotePath(path);

    if (options.recursive !== true) {
      await this.sftp.mkdir(remotePath);
      return;
    }

    const segments = remotePath.split("/").filter((s) => s.length > 0);
    let current = "";

    for (const segment of segments) {
      current = `${current}/${segment}`;
      try {
        await this.sftp.mkdir(current);
      } catch (error) {
        // If the directory already exists, that's fine for recursive creation.
        if (error instanceof ZeroTransferError && error.code === "ZERO_TRANSFER_PATH_NOT_FOUND") {
          // Re-throw — the parent is missing unexpectedly.
          throw error;
        }
        // Verify it's actually a directory before swallowing the error.
        try {
          const attrs = await this.sftp.lstat(current);
          const mode = attrs.permissions ?? 0;
          if (nativeSftpEntryTypeFromMode(mode) !== "directory") {
            throw error;
          }
          // It exists and is a directory — continue.
        } catch {
          throw error;
        }
      }
    }
  }

  async rmdir(path: string, options: RmdirOptions = {}): Promise<void> {
    nativeSftpThrowIfAborted(options.signal, path, "rmdir");
    const remotePath = normalizeRemotePath(path);

    if (options.recursive === true) {
      await this.removeDirRecursive(remotePath, options);
      return;
    }

    try {
      await this.sftp.rmdir(remotePath);
    } catch (error) {
      if (
        options.ignoreMissing === true &&
        error instanceof ZeroTransferError &&
        error.code === "ZERO_TRANSFER_PATH_NOT_FOUND"
      ) {
        return;
      }
      throw error;
    }
  }

  private async removeDirRecursive(remotePath: string, options: RmdirOptions): Promise<void> {
    let entries: SftpNameEntry[];

    try {
      entries = await this.sftp.readdirAll(remotePath);
    } catch (error) {
      if (
        options.ignoreMissing === true &&
        error instanceof ZeroTransferError &&
        error.code === "ZERO_TRANSFER_PATH_NOT_FOUND"
      ) {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      if (entry.filename === "." || entry.filename === "..") continue;

      const childPath = joinRemotePath(remotePath, entry.filename);
      const mode = entry.attrs.permissions ?? 0;
      const isDir = nativeSftpEntryTypeFromMode(mode) === "directory";

      if (isDir) {
        await this.removeDirRecursive(childPath, {});
      } else {
        await this.sftp.remove(childPath);
      }
    }

    await this.sftp.rmdir(remotePath);
  }
}

// -- Transfer operations -------------------------------------------------------

class NativeSftpTransferOperations implements ProviderTransferOperations {
  constructor(private readonly sftp: SftpSession) {}

  async read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    request.throwIfAborted();
    const remotePath = normalizeRemotePath(request.endpoint.path);

    const statAttrs = await this.sftp.lstat(remotePath);
    const mode = statAttrs.permissions ?? 0;

    if (nativeSftpEntryTypeFromMode(mode) !== "file") {
      throw new ConfigurationError({
        details: { path: remotePath, provider: NATIVE_SFTP_PROVIDER_ID },
        message: `Native SFTP path is not a file: ${remotePath}`,
        protocol: "sftp",
        retryable: false,
      });
    }

    const totalSize = statAttrs.size !== undefined ? Number(statAttrs.size) : 0;
    const range = resolveNativeSftpReadRange(totalSize, request.range);

    return {
      content: this.createReadSource(remotePath, range, request),
      totalBytes: range.length,
      ...(range.offset > 0 ? { bytesRead: range.offset } : {}),
    };
  }

  private async *createReadSource(
    path: string,
    range: { offset: number; length: number },
    request: ProviderTransferReadRequest,
  ): AsyncGenerator<Uint8Array> {
    if (range.length <= 0) return;

    request.throwIfAborted();
    const handle = await this.sftp.open(path, SFTP_OPEN_FLAG.READ);

    try {
      let remaining = range.length;
      let offset = range.offset;

      while (remaining > 0) {
        request.throwIfAborted();
        const chunkLen = Math.min(SFTP_READ_CHUNK_BYTES, remaining);
        const data = await this.sftp.read(handle, BigInt(offset), chunkLen);

        if (data === null) break;

        yield new Uint8Array(data);
        offset += data.length;
        remaining -= data.length;
      }
    } finally {
      await this.sftp.close(handle).catch(() => {
        // Ignore close errors to preserve the original stream error.
      });
    }
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const remotePath = normalizeRemotePath(request.endpoint.path);
    const startOffset = normalizeNativeSftpOffset(request.offset, remotePath);

    const pflags =
      startOffset !== undefined && startOffset > 0
        ? SFTP_OPEN_FLAG.WRITE
        : SFTP_OPEN_FLAG.WRITE | SFTP_OPEN_FLAG.CREAT | SFTP_OPEN_FLAG.TRUNC;

    request.throwIfAborted();
    const handle = await this.sftp.open(remotePath, pflags);

    let bytesTransferred = 0;

    try {
      let writeOffset = startOffset ?? 0;

      for await (const chunk of request.content) {
        request.throwIfAborted();
        if (chunk.byteLength === 0) continue;
        await this.sftp.write(handle, BigInt(writeOffset), chunk);
        writeOffset += chunk.byteLength;
        bytesTransferred += chunk.byteLength;
        request.reportProgress(bytesTransferred, request.totalBytes);
      }
    } finally {
      await this.sftp.close(handle).catch(() => {});
    }

    const result: ProviderTransferWriteResult = {
      bytesTransferred,
      resumed: (startOffset ?? 0) > 0,
      totalBytes: request.totalBytes ?? (startOffset ?? 0) + bytesTransferred,
      verified: request.verification?.verified ?? false,
    };

    if (request.verification !== undefined) {
      result.verification = cloneNativeSftpVerification(request.verification);
    }

    return result;
  }
}

// -- Connection helpers --------------------------------------------------------

function openNativeSftpSocket(
  profile: ResolvedConnectionProfile,
  options: NativeSftpProviderOptions,
): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const port = profile.port ?? NATIVE_SFTP_DEFAULT_PORT;
    const host = profile.host;
    const timeoutMs = profile.timeoutMs ?? options.readyTimeoutMs;

    if (profile.signal?.aborted === true) {
      reject(
        new AbortError({
          details: { operation: "connect" },
          host,
          message: "Native SFTP connection was aborted before socket open",
          protocol: "sftp",
          retryable: false,
        }),
      );
      return;
    }

    const socket = createConnection({ host, port });

    if (timeoutMs !== undefined) {
      socket.setTimeout(timeoutMs);
    }

    const cleanup = (): void => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      socket.off("timeout", handleTimeout);
      profile.signal?.removeEventListener("abort", handleAbort);
    };

    const handleConnect = (): void => {
      socket.setTimeout(0);
      cleanup();
      resolve(socket);
    };

    const handleError = (err: Error): void => {
      cleanup();
      socket.destroy();
      reject(err);
    };

    const handleTimeout = (): void => {
      cleanup();
      socket.destroy();
      reject(
        new TimeoutError({
          details: { operation: "connect" },
          host,
          message: `Native SFTP socket connection timed out after ${timeoutMs ?? "?"}ms`,
          protocol: "sftp",
          retryable: true,
        }),
      );
    };

    const handleAbort = (): void => {
      cleanup();
      socket.destroy();
      reject(
        new AbortError({
          details: { operation: "connect" },
          host,
          message: "Native SFTP connection was aborted",
          protocol: "sftp",
          retryable: false,
        }),
      );
    };

    socket.once("connect", handleConnect);
    socket.once("error", handleError);
    socket.once("timeout", handleTimeout);
    profile.signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

function buildNativeSftpCredential(
  profile: ResolvedConnectionProfile,
  username: string,
): SshPasswordCredential | SshKeyboardInteractiveCredential | SshPublickeyCredential {
  const password = resolveNativeSftpTextSecret(profile.password);
  const keyboardInteractive = profile.ssh?.keyboardInteractive;
  const privateKey = profile.ssh?.privateKey;

  // Public-key auth wins over password when supplied — matches OpenSSH's default
  // ordering and the legacy ssh2-backed provider's behaviour.
  if (privateKey !== undefined) {
    return buildNativePublickeyCredential(profile, username);
  }

  if (password !== undefined) {
    return {
      password,
      type: "password",
      username,
    };
  }

  if (keyboardInteractive !== undefined) {
    return {
      respond: async (name, instruction, prompts) => {
        const challenge = {
          instructions: instruction,
          language: "",
          name,
          prompts: prompts.map((p) => ({
            echo: p.echo,
            prompt: p.prompt,
          })),
        };
        const result = await keyboardInteractive(challenge);
        return Array.from(result);
      },
      type: "keyboard-interactive",
      username,
    };
  }

  throw new ConfigurationError({
    details: { provider: NATIVE_SFTP_PROVIDER_ID },
    message: "Native SFTP profiles require ssh.privateKey, password, or ssh.keyboardInteractive",
    protocol: "sftp",
    retryable: false,
  });
}

function buildNativePublickeyCredential(
  profile: ResolvedConnectionProfile,
  username: string,
): SshPublickeyCredential {
  const keyMaterial = profile.ssh?.privateKey;
  if (keyMaterial === undefined) {
    throw new ConfigurationError({
      details: { provider: NATIVE_SFTP_PROVIDER_ID },
      message: "ssh.privateKey is required for public-key authentication",
      protocol: "sftp",
      retryable: false,
    });
  }
  const passphrase = profile.ssh?.passphrase;
  try {
    const privateKey = createPrivateKey({
      key: Buffer.isBuffer(keyMaterial) ? keyMaterial : keyMaterial,
      ...(passphrase === undefined
        ? {}
        : {
            passphrase: Buffer.isBuffer(passphrase) ? passphrase : passphrase,
          }),
    });
    return buildPublickeyCredential({ privateKey, username });
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: {
        originalMessage: error instanceof Error ? error.message : String(error),
        provider: NATIVE_SFTP_PROVIDER_ID,
      },
      message:
        "Failed to parse ssh.privateKey: ensure the key is in OpenSSH or PKCS#8 PEM format and the passphrase (if any) is correct",
      protocol: "sftp",
      retryable: false,
    });
  }
}

function mapNativeSftpConnectError(error: unknown, host: string): ZeroTransferError {
  if (error instanceof ZeroTransferError) {
    return error;
  }

  if (isNativeSftpAuthFailure(error)) {
    return new AuthenticationError({
      cause: error,
      host,
      message: "Native SFTP authentication failed",
      protocol: "sftp",
      retryable: false,
    });
  }

  return new ConnectionError({
    cause: error,
    details: { originalMessage: getNativeSftpErrorMessage(error) },
    host,
    message: `Native SFTP connection failed: ${getNativeSftpErrorMessage(error)}`,
    protocol: "sftp",
    retryable: true,
  });
}

function isNativeSftpAuthFailure(error: unknown): boolean {
  if (error instanceof AuthenticationError) return true;
  const msg = getNativeSftpErrorMessage(error).toLowerCase();
  return msg.includes("auth") || msg.includes("permission denied");
}

// -- Attribute mapping ---------------------------------------------------------

function mapNativeSftpEntry(path: string, name: string, attrs: SftpFileAttributes): RemoteEntry {
  const mode = attrs.permissions ?? 0;
  const entry: RemoteEntry = {
    name,
    path,
    ...(attrs.gid !== undefined ? { group: String(attrs.gid) } : {}),
    ...(attrs.uid !== undefined ? { owner: String(attrs.uid) } : {}),
    permissions: { raw: formatNativeSftpMode(mode) },
    raw: {
      attrs: {
        atime: attrs.atime ?? 0,
        gid: attrs.gid ?? 0,
        mode,
        mtime: attrs.mtime ?? 0,
        size: attrs.size !== undefined ? Number(attrs.size) : 0,
        uid: attrs.uid ?? 0,
      },
    },
    type: nativeSftpEntryTypeFromMode(mode),
  };

  if (attrs.size !== undefined) {
    entry.size = Number(attrs.size);
  }

  if (attrs.mtime !== undefined) {
    entry.modifiedAt = new Date(attrs.mtime * 1000);
  }

  if (attrs.atime !== undefined) {
    entry.accessedAt = new Date(attrs.atime * 1000);
  }

  return entry;
}

function nativeSftpEntryTypeFromMode(mode: number): RemoteEntryType {
  const fileTypeBits = mode & 0o170000;
  if (fileTypeBits === 0o100000) return "file";
  if (fileTypeBits === 0o040000) return "directory";
  if (fileTypeBits === 0o120000) return "symlink";
  return "unknown";
}

function formatNativeSftpMode(mode: number): string {
  return mode.toString(8).padStart(6, "0");
}

function compareNativeSftpEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

// -- Range and transfer helpers -------------------------------------------------

function resolveNativeSftpReadRange(
  size: number,
  range: ProviderTransferReadRequest["range"],
): { offset: number; length: number } {
  if (range === undefined) {
    return { length: size, offset: 0 };
  }

  const offset = Math.min(Math.max(0, Math.floor(range.offset)), size);
  const requestedLength =
    range.length === undefined ? size - offset : Math.max(0, Math.floor(range.length));
  const length = Math.min(requestedLength, size - offset);

  return { length, offset };
}

function normalizeNativeSftpOffset(value: number | undefined, path: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field: "offset", path, provider: NATIVE_SFTP_PROVIDER_ID },
      message: "Native SFTP write offset must be a non-negative finite number",
      protocol: "sftp",
      retryable: false,
    });
  }
  return Math.floor(value);
}

function cloneNativeSftpVerification(v: TransferVerificationResult): TransferVerificationResult {
  const clone: TransferVerificationResult = { verified: v.verified };
  if (v.method !== undefined) clone.method = v.method;
  if (v.checksum !== undefined) clone.checksum = v.checksum;
  if (v.expectedChecksum !== undefined) clone.expectedChecksum = v.expectedChecksum;
  if (v.actualChecksum !== undefined) clone.actualChecksum = v.actualChecksum;
  if (v.details !== undefined) clone.details = { ...v.details };
  return clone;
}

// -- Credential helpers --------------------------------------------------------

/**
 * Normalises pinned SHA-256 host-key fingerprints into the unpadded base64 form
 * produced by `sha256(hostKeyBlob)`. Accepts the same input shapes as the
 * legacy provider: `SHA256:base64`, raw base64, or hex (with optional `:`).
 */
function normalizeNativeHostKeyPins(
  value: string | readonly string[] | undefined,
): Set<string> | undefined {
  if (value === undefined) return undefined;
  const pins: readonly string[] = typeof value === "string" ? [value] : value;
  if (pins.length === 0) return undefined;

  const normalized = new Set<string>();
  for (const pin of pins) {
    const trimmed = pin.trim();
    const hex = trimmed.replace(/:/g, "");
    if (hex.length === 64 && /^[a-f0-9]+$/i.test(hex)) {
      normalized.add(Buffer.from(hex, "hex").toString("base64").replace(/=+$/g, ""));
      continue;
    }
    const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;
    const padded = bare.length % 4 === 0 ? bare : `${bare}${"=".repeat(4 - (bare.length % 4))}`;
    normalized.add(Buffer.from(padded, "base64").toString("base64").replace(/=+$/g, ""));
  }
  return normalized;
}

/**
 * Reads OpenSSH-format `known_hosts` content from the resolved profile and
 * returns the parsed entries. Returns `undefined` when no source is supplied
 * or all sources are empty.
 */
function parseNativeKnownHosts(
  source: SecretValue | SecretValue[] | undefined,
): readonly KnownHostsEntry[] | undefined {
  if (source === undefined) return undefined;
  const sources = Array.isArray(source) ? source : [source];
  const entries: KnownHostsEntry[] = [];
  for (const value of sources) {
    const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
    if (text.length === 0) continue;
    entries.push(...parseKnownHosts(text));
  }
  return entries.length === 0 ? undefined : entries;
}

/**
 * Builds the host-key verification hook combining `pinnedHostKeySha256` and
 * `knownHosts` policies. When neither is supplied returns `undefined`, leaving
 * the transport with signature-only verification (a working but
 * unauthenticated trust model — production deployments should pin or use
 * known_hosts).
 *
 * Both gates apply when both are configured: the key must satisfy every
 * supplied policy. `@revoked` known_hosts entries that match the host and
 * key always cause rejection.
 */
function buildNativeHostKeyVerifier(input: {
  host: string;
  port: number;
  pins: Set<string> | undefined;
  knownHosts: readonly KnownHostsEntry[] | undefined;
}):
  | ((arg: { hostKeyBlob: Buffer; hostKeySha256: Buffer; algorithmName: string }) => void)
  | undefined {
  const { host, knownHosts, pins, port } = input;
  if (pins === undefined && knownHosts === undefined) return undefined;

  return ({ hostKeyBlob }): void => {
    if (pins !== undefined) {
      const fingerprint = createHash("sha256")
        .update(hostKeyBlob)
        .digest("base64")
        .replace(/=+$/g, "");
      if (!pins.has(fingerprint)) {
        throw new AuthenticationError({
          details: { fingerprint, host },
          message: "SSH server host key does not match any pinned fingerprint",
          protocol: "sftp",
          retryable: false,
        });
      }
    }

    if (knownHosts !== undefined) {
      const keyBase64 = hostKeyBlob.toString("base64");
      let matched = false;
      for (const entry of knownHosts) {
        if (!matchKnownHostsEntry(entry, host, port)) continue;
        if (entry.keyBase64 !== keyBase64) continue;
        if (entry.marker === "revoked") {
          throw new AuthenticationError({
            details: { host, marker: entry.marker },
            message: "SSH server host key is marked @revoked in known_hosts",
            protocol: "sftp",
            retryable: false,
          });
        }
        if (entry.marker === undefined) {
          matched = true;
        }
        // `cert-authority` entries are not yet supported — they require
        // OpenSSH certificate parsing. Treat them as no-match for now.
      }
      if (!matched) {
        throw new AuthenticationError({
          details: { host, port },
          message: "SSH server host key is not present in known_hosts for this host",
          protocol: "sftp",
          retryable: false,
        });
      }
    }
  };
}

function requireNativeSftpUsername(profile: ResolvedConnectionProfile): string {
  const text = resolveNativeSftpTextSecret(profile.username);
  if (text === undefined) {
    throw new ConfigurationError({
      details: { field: "username", provider: NATIVE_SFTP_PROVIDER_ID },
      message: "Native SFTP profiles require a username",
      protocol: "sftp",
      retryable: false,
    });
  }
  return text;
}

function resolveNativeSftpTextSecret(value: SecretValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : value;
  if (text.length === 0) return undefined;
  return text;
}

// -- Guard helpers -------------------------------------------------------------

function nativeSftpThrowIfAborted(
  signal: AbortSignal | undefined,
  path: string,
  operation: "list" | "stat" | "remove" | "rename" | "mkdir" | "rmdir",
): void {
  if (signal?.aborted !== true) return;
  throw new AbortError({
    details: { operation },
    message: `Native SFTP ${operation} was aborted`,
    path,
    protocol: "sftp",
    retryable: false,
  });
}

function getNativeSftpErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// -- Option validation ---------------------------------------------------------

function validateNativeSftpOptions(options: NativeSftpProviderOptions): void {
  if (
    options.readyTimeoutMs !== undefined &&
    (!Number.isFinite(options.readyTimeoutMs) || options.readyTimeoutMs <= 0)
  ) {
    throw new ConfigurationError({
      details: { readyTimeoutMs: options.readyTimeoutMs },
      message: "Native SFTP provider readyTimeoutMs must be a positive finite number",
      protocol: "sftp",
      retryable: false,
    });
  }
  if (
    options.keepaliveIntervalMs !== undefined &&
    (!Number.isFinite(options.keepaliveIntervalMs) || options.keepaliveIntervalMs < 0)
  ) {
    throw new ConfigurationError({
      details: { keepaliveIntervalMs: options.keepaliveIntervalMs },
      message: "Native SFTP provider keepaliveIntervalMs must be a non-negative finite number",
      protocol: "sftp",
      retryable: false,
    });
  }
}
