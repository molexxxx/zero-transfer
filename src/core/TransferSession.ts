/**
 * Active provider session contract returned by provider-neutral connections.
 *
 * @module core/TransferSession
 */
import type { RemoteFileSystem } from "../providers/RemoteFileSystem";
import type { ProviderTransferOperations } from "../providers/ProviderTransferOperations";
import type { CapabilitySet } from "./CapabilitySet";
import type { ProviderId } from "./ProviderId";

/**
 * Connected provider session exposed through {@link TransferClient.connect}.
 */
export interface TransferSession<TRaw = unknown> {
  /** Provider backing this session. */
  provider: ProviderId;
  /** Provider capabilities available for this connected session. */
  capabilities: CapabilitySet;
  /** Provider-neutral remote file-system operations. */
  fs: RemoteFileSystem;
  /** Optional provider-backed transfer read/write operations. */
  transfers?: ProviderTransferOperations;
  /** Disconnects and releases provider resources. */
  disconnect(): Promise<void>;
  /** Returns a provider-specific advanced interface when one exists. */
  raw?(): TRaw;
}
