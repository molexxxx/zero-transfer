/**
 * Provider registry for the provider-neutral ZeroTransfer core.
 *
 * @module core/ProviderRegistry
 */
import { ConfigurationError, UnsupportedFeatureError } from "../errors/ZeroTransferError";
import type { ProviderFactory } from "../providers/ProviderFactory";
import type { CapabilitySet } from "./CapabilitySet";
import type { ProviderId } from "./ProviderId";

/** Mutable registry of provider factories available to a transfer client. */
export class ProviderRegistry {
  private readonly factories = new Map<ProviderId, ProviderFactory>();

  /**
   * Creates a registry and optionally seeds it with provider factories.
   *
   * @param providers - Provider factories to register immediately.
   */
  constructor(providers: Iterable<ProviderFactory> = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  /**
   * Registers a provider factory.
   *
   * @param provider - Provider factory to add.
   * @returns This registry for fluent setup.
   * @throws {@link ConfigurationError} When a provider id is registered twice.
   */
  register(provider: ProviderFactory): this {
    if (this.factories.has(provider.id)) {
      throw new ConfigurationError({
        details: { provider: provider.id },
        message: `Provider "${provider.id}" is already registered`,
        retryable: false,
      });
    }

    this.factories.set(provider.id, provider);
    return this;
  }

  /**
   * Removes a provider factory from the registry.
   *
   * @param providerId - Provider id to remove.
   * @returns `true` when a provider was removed.
   */
  unregister(providerId: ProviderId): boolean {
    return this.factories.delete(providerId);
  }

  /**
   * Checks whether a provider id is registered.
   *
   * @param providerId - Provider id to inspect.
   * @returns `true` when a provider factory exists.
   */
  has(providerId: ProviderId): boolean {
    return this.factories.has(providerId);
  }

  /**
   * Gets a provider factory when registered.
   *
   * @param providerId - Provider id to retrieve.
   * @returns The provider factory, or `undefined` when missing.
   */
  get(providerId: ProviderId): ProviderFactory | undefined {
    return this.factories.get(providerId);
  }

  /**
   * Gets a registered provider factory or throws a typed SDK error.
   *
   * @param providerId - Provider id to retrieve.
   * @returns The registered provider factory.
   * @throws {@link UnsupportedFeatureError} When no provider has been registered.
   */
  require(providerId: ProviderId): ProviderFactory {
    const provider = this.get(providerId);

    if (provider === undefined) {
      throw new UnsupportedFeatureError({
        details: { provider: providerId },
        message: `Provider "${providerId}" is not registered`,
        retryable: false,
      });
    }

    return provider;
  }

  /**
   * Gets a provider capability snapshot when registered.
   *
   * @param providerId - Provider id to inspect.
   * @returns Capability snapshot, or `undefined` when missing.
   */
  getCapabilities(providerId: ProviderId): CapabilitySet | undefined {
    return this.get(providerId)?.capabilities;
  }

  /**
   * Gets a provider capability snapshot or throws a typed SDK error.
   *
   * @param providerId - Provider id to inspect.
   * @returns Capability snapshot for the registered provider.
   * @throws {@link UnsupportedFeatureError} When no provider has been registered.
   */
  requireCapabilities(providerId: ProviderId): CapabilitySet {
    return this.require(providerId).capabilities;
  }

  /**
   * Lists registered provider factories in insertion order.
   *
   * @returns Registered provider factories.
   */
  list(): ProviderFactory[] {
    return [...this.factories.values()];
  }

  /**
   * Lists registered provider capabilities in insertion order.
   *
   * @returns Capability snapshots for every registered provider.
   */
  listCapabilities(): CapabilitySet[] {
    return this.list().map((provider) => provider.capabilities);
  }
}
