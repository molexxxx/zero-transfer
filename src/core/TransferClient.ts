/**
 * Provider-neutral transfer client foundation.
 *
 * @module core/TransferClient
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import {
  emitLog,
  noopLogger,
  type LogRecordInput,
  type ZeroTransferLogger,
} from "../logging/Logger";
import { validateConnectionProfile } from "../profiles/ProfileValidator";
import type { ProviderFactory } from "../providers/ProviderFactory";
import type { TransferRetryPolicy } from "../transfers/TransferEngine";
import type { TransferTimeoutPolicy } from "../transfers/TransferJob";
import type { ConnectionProfile } from "../types/public";
import type { CapabilitySet } from "./CapabilitySet";
import type { ProviderId } from "./ProviderId";
import { isClassicProviderId, resolveProviderId } from "./ProviderId";
import { ProviderRegistry } from "./ProviderRegistry";
import type { TransferSession } from "./TransferSession";

/**
 * Client-level execution defaults applied when a call site does not supply
 * its own value.
 *
 * Defaults are consumed by {@link runRoute}, the one-shot helpers
 * ({@link uploadFile}, {@link downloadFile}, {@link copyBetween}),
 * {@link TransferQueue} (via its `client` option), and scheduled routes fired
 * through {@link MftScheduler}. The {@link TransferEngine} primitive stays
 * fully explicit: defaults never reach `engine.execute()` directly.
 *
 * Per-call options always win over client defaults.
 *
 * Additional default slots (`verify`, `resume`, `compression`, `policy`) land
 * here as their features ship in later releases; the shape is additive.
 *
 * @example Resilient defaults for every transfer in an application
 * ```ts
 * import { createDefaultRetryPolicy, createTransferClient } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createSftpProviderFactory(), createS3ProviderFactory()],
 *   defaults: {
 *     retry: createDefaultRetryPolicy(),
 *     timeout: { stallTimeoutMs: 30_000 },
 *   },
 * });
 * ```
 */
export interface TransferClientDefaults {
  /** Default retry policy for transfers executed through this client. */
  retry?: TransferRetryPolicy;
  /** Default timeout policy for transfers executed through this client. */
  timeout?: TransferTimeoutPolicy;
}

/** Options used to create a provider-neutral transfer client. */
export interface TransferClientOptions {
  /** Existing registry to reuse. When omitted, a fresh empty registry is created. */
  registry?: ProviderRegistry;
  /** Provider factories to register with the client registry. */
  providers?: ProviderFactory[];
  /** Structured logger used for client lifecycle records. */
  logger?: ZeroTransferLogger;
  /** Execution defaults applied when call sites omit their own values. */
  defaults?: TransferClientDefaults;
}

/** Small provider-neutral client that owns provider lookup and connection setup. */
export class TransferClient {
  /** Provider registry used by this client. */
  readonly registry: ProviderRegistry;

  /** Execution defaults applied when call sites omit their own values. */
  readonly defaults?: TransferClientDefaults;

  private readonly logger: ZeroTransferLogger;

  /**
   * Creates a transfer client without opening any provider connections.
   *
   * @param options - Optional registry, provider factories, logger, and execution defaults.
   */
  constructor(options: TransferClientOptions = {}) {
    this.registry = options.registry ?? new ProviderRegistry();
    this.logger = options.logger ?? noopLogger;
    if (options.defaults !== undefined) {
      this.defaults = { ...options.defaults };
    }

    for (const provider of options.providers ?? []) {
      this.registry.register(provider);
    }
  }

  /**
   * Registers a provider factory with this client's registry.
   *
   * @param provider - Provider factory to register.
   * @returns This client for fluent setup.
   */
  registerProvider(provider: ProviderFactory): this {
    this.registry.register(provider);
    return this;
  }

  /**
   * Checks whether this client can create sessions for a provider id.
   *
   * @param providerId - Provider id to inspect.
   * @returns `true` when a provider factory is registered.
   */
  hasProvider(providerId: ProviderId): boolean {
    return this.registry.has(providerId);
  }

  /** Lists all registered provider capability snapshots. */
  getCapabilities(): CapabilitySet[];
  /** Gets a specific provider capability snapshot. */
  getCapabilities(providerId: ProviderId): CapabilitySet;
  getCapabilities(providerId?: ProviderId): CapabilitySet | CapabilitySet[] {
    if (providerId === undefined) {
      return this.registry.listCapabilities();
    }

    return this.registry.requireCapabilities(providerId);
  }

  /**
   * Opens a provider session using `profile.provider`, with `profile.protocol` as compatibility fallback.
   *
   * @param profile - Connection profile containing a provider or legacy protocol field.
   * @returns A connected provider session.
   * @throws {@link ConfigurationError} When neither provider nor protocol is present.
   */
  async connect(profile: ConnectionProfile): Promise<TransferSession> {
    const validProfile = validateConnectionProfile(profile);
    const providerId = resolveProviderId(validProfile);

    if (providerId === undefined) {
      throw new ConfigurationError({
        message: "Connection profiles must include a provider or protocol",
        retryable: false,
      });
    }

    const providerFactory = this.registry.require(providerId);
    const provider = providerFactory.create();
    const normalizedProfile: ConnectionProfile = {
      ...validProfile,
      provider: providerId,
    };

    if (normalizedProfile.protocol === undefined && isClassicProviderId(providerId)) {
      normalizedProfile.protocol = providerId;
    }

    emitLog(this.logger, "info", createConnectLogRecord(normalizedProfile, providerId));

    return provider.connect(normalizedProfile);
  }
}

function createConnectLogRecord(
  profile: ConnectionProfile,
  providerId: ProviderId,
): LogRecordInput {
  const record: LogRecordInput = {
    component: "core",
    host: profile.host,
    message: "Connecting through provider",
    provider: providerId,
  };

  if (isClassicProviderId(providerId)) {
    record.protocol = providerId;
  }

  return record;
}
