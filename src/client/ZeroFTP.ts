/**
 * Compatibility client facade for the ZeroTransfer SDK foundation.
 *
 * This module intentionally keeps the top-level API small while protocol-specific
 * behavior is delegated to injected adapters. The facade owns lifecycle state,
 * event emission, logging coordination, and common capability discovery.
 *
 * @module client/ZeroFTP
 */
import { EventEmitter } from "node:events";
import { UnsupportedFeatureError } from "../errors/ZeroTransferError";
import { emitLog, noopLogger, type ZeroFTPLogger } from "../logging/Logger";
import type { RemoteFileAdapter } from "../protocols/RemoteFileAdapter";
import { isClassicProviderId } from "../core/ProviderId";
import type {
  ConnectionProfile,
  ListOptions,
  RemoteEntry,
  RemoteProtocol,
  RemoteStat,
  StatOptions,
} from "../types/public";

/**
 * Construction options for a {@link ZeroFTP} instance.
 *
 * @remarks
 * The adapter option is primarily used by protocol implementations and tests. Until
 * the built-in FTP, FTPS, and SFTP adapters are implemented, callers can inject a
 * compatible adapter to exercise the facade contract.
 */
export interface ZeroFTPOptions {
  /** Protocol used when the connection profile does not provide one. */
  protocol?: RemoteProtocol;
  /** Structured logger used for lifecycle and operation records. */
  logger?: ZeroFTPLogger;
  /** Protocol adapter that performs concrete remote file operations. */
  adapter?: RemoteFileAdapter;
}

/**
 * Lightweight capability snapshot for the current client instance.
 */
export interface ZeroFTPCapabilities {
  /** The protocol selected for this client facade. */
  protocol: RemoteProtocol;
  /** Whether a concrete protocol adapter has been supplied. */
  adapterReady: boolean;
}

/**
 * Compatibility SDK entry point for FTP, FTPS, and SFTP workflows.
 *
 * @remarks
 * ZeroFTP extends Node.js EventEmitter so applications can observe lifecycle
 * events while still using promise-based APIs for operations. The facade is
 * deliberately protocol-neutral; concrete behavior lives behind
 * {@link RemoteFileAdapter}.
 *
 * @deprecated Import `ZeroTransfer` from `@zero-transfer/sdk` for new code.
 */
export class ZeroFTP extends EventEmitter {
  /** Protocol selected for this client instance. */
  readonly protocol: RemoteProtocol;

  private readonly logger: ZeroFTPLogger;
  private readonly adapter: RemoteFileAdapter | undefined;
  private connected = false;

  /**
   * Creates a client facade without opening a network connection.
   *
   * @param options - Optional facade configuration, logger, and protocol adapter.
   */
  constructor(options: ZeroFTPOptions = {}) {
    super();
    this.protocol = options.protocol ?? "ftp";
    this.logger = options.logger ?? noopLogger;
    this.adapter = options.adapter;
  }

  /**
   * Creates a new client facade using the provided options.
   *
   * @param options - Optional facade configuration, logger, and adapter.
   * @returns A disconnected {@link ZeroFTP} instance.
   */
  static create(options: ZeroFTPOptions = {}): ZeroFTP {
    return new ZeroFTP(options);
  }

  /**
   * Creates a client and connects it in one step.
   *
   * @param profile - Remote host, authentication, and protocol connection settings.
   * @param options - Optional facade settings that can be overridden by the profile.
   * @returns A connected {@link ZeroFTP} instance.
   * @throws {@link UnsupportedFeatureError} When no adapter is available for the protocol.
   */
  static async connect(profile: ConnectionProfile, options: ZeroFTPOptions = {}): Promise<ZeroFTP> {
    const clientOptions: ZeroFTPOptions = { ...options };

    if (profile.logger !== undefined) {
      clientOptions.logger = profile.logger;
    }

    if (profile.protocol !== undefined) {
      clientOptions.protocol = profile.protocol;
    } else if (isClassicProviderId(profile.provider)) {
      clientOptions.protocol = profile.provider;
    }

    const client = new ZeroFTP(clientOptions);
    await client.connect(profile);
    return client;
  }

  /**
   * Opens a remote connection through the configured protocol adapter.
   *
   * @param profile - Remote host, authentication, timeout, logger, and protocol settings.
   * @returns A promise that resolves after the adapter reports a successful connection.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async connect(profile: ConnectionProfile): Promise<void> {
    const adapter = this.requireAdapter();
    const protocol =
      profile.protocol ??
      (isClassicProviderId(profile.provider) ? profile.provider : this.protocol);
    emitLog(this.logger, "info", {
      component: "client",
      host: profile.host,
      message: "Connecting",
      protocol,
    });
    await adapter.connect({
      ...profile,
      protocol,
    });
    this.connected = true;
    this.emit("connect", {
      host: profile.host,
      protocol,
    });
  }

  /**
   * Closes the active remote connection if one exists.
   *
   * @returns A promise that resolves after the adapter disconnects or immediately when idle.
   */
  async disconnect(): Promise<void> {
    if (this.adapter !== undefined && this.connected) {
      await this.adapter.disconnect();
    }

    this.connected = false;
    this.emit("disconnect");
  }

  /**
   * Checks whether the facade currently considers the adapter connected.
   *
   * @returns `true` after a successful connection and before disconnection.
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Describes protocol and adapter readiness for feature discovery.
   *
   * @returns A capability snapshot for diagnostics and UI state.
   */
  getCapabilities(): ZeroFTPCapabilities {
    return {
      adapterReady: this.adapter !== undefined,
      protocol: this.protocol,
    };
  }

  /**
   * Lists remote entries for a path using the configured adapter.
   *
   * @param path - Remote directory path to inspect.
   * @param options - Optional listing controls such as recursion and abort signal.
   * @returns Normalized remote entries for the requested directory.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async list(path: string, options?: ListOptions): Promise<RemoteEntry[]> {
    return this.requireAdapter().list(path, options);
  }

  /**
   * Reads metadata for a remote path using the configured adapter.
   *
   * @param path - Remote file, directory, or symbolic-link path to inspect.
   * @param options - Optional stat controls such as abort signal.
   * @returns Normalized metadata for an existing remote entry.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async stat(path: string, options?: StatOptions): Promise<RemoteStat> {
    return this.requireAdapter().stat(path, options);
  }

  /**
   * Returns the configured adapter or raises the alpha unsupported-feature error.
   *
   * @returns A concrete remote file adapter ready to execute operations.
   * @throws {@link UnsupportedFeatureError} When no adapter has been provided.
   */
  private requireAdapter(): RemoteFileAdapter {
    if (this.adapter === undefined) {
      throw new UnsupportedFeatureError({
        message: `The ${this.protocol.toUpperCase()} adapter is not implemented in this alpha foundation yet`,
        protocol: this.protocol,
        retryable: false,
      });
    }

    return this.adapter;
  }
}
