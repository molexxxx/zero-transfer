/**
 * Factory for provider-neutral ZeroTransfer clients.
 *
 * @module core/createTransferClient
 */
import { TransferClient, type TransferClientOptions } from "./TransferClient";

/**
 * Creates a provider-neutral transfer client.
 *
 * @param options - Optional registry, provider factories, and logger.
 * @returns A disconnected {@link TransferClient} instance.
 */
export function createTransferClient(options: TransferClientOptions = {}): TransferClient {
  return new TransferClient(options);
}
