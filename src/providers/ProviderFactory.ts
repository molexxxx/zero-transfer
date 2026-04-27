/**
 * Provider factory contracts used by the provider registry.
 *
 * @module providers/ProviderFactory
 */
import type { CapabilitySet } from "../core/CapabilitySet";
import type { ProviderId } from "../core/ProviderId";
import type { TransferProvider } from "./Provider";

/** Factory registered with {@link ProviderRegistry} to create providers on demand. */
export interface ProviderFactory<TProvider extends TransferProvider = TransferProvider> {
  /** Provider id created by this factory. */
  id: ProviderId;
  /** Capability snapshot available without opening a network connection. */
  capabilities: CapabilitySet;
  /** Creates an isolated provider instance for a connection attempt. */
  create(): TProvider;
}
