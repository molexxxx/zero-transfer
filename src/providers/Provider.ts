/**
 * Provider implementation contracts for ZeroTransfer adapters.
 *
 * @module providers/Provider
 */
import type { TransferSession } from "../core/TransferSession";
import type { ConnectionProfile } from "../types/public";
import type { CapabilitySet } from "../core/CapabilitySet";
import type { ProviderId } from "../core/ProviderId";

/** Provider implementation that can open transfer sessions. */
export interface TransferProvider<TSession extends TransferSession = TransferSession> {
  /** Stable provider id. */
  id: ProviderId;
  /** Capabilities advertised by this provider implementation. */
  capabilities: CapabilitySet;
  /** Opens a connected provider session. */
  connect(profile: ConnectionProfile): Promise<TSession>;
}
