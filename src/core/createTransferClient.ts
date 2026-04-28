/**
 * Factory for provider-neutral ZeroTransfer clients.
 *
 * @module core/createTransferClient
 */
import { TransferClient, type TransferClientOptions } from "./TransferClient";

/**
 * Creates a provider-neutral transfer client.
 *
 * The returned client owns a registry of provider factories and produces
 * `TransferSession` instances on demand via {@link TransferClient.connect}.
 * Registering only the providers you actually use keeps bundle size small
 * (each factory pulls in its own SDK dependencies).
 *
 * @param options - Optional registry, provider factories, and logger.
 * @returns A disconnected {@link TransferClient} instance.
 *
 * @example Multi-provider client
 * ```ts
 * import {
 *   createS3ProviderFactory,
 *   createSftpProviderFactory,
 *   createTransferClient,
 * } from "@zero-transfer/sdk";
 *
 * const client = createTransferClient({
 *   providers: [createSftpProviderFactory(), createS3ProviderFactory()],
 * });
 *
 * const session = await client.connect({
 *   host: "sftp.example.com",
 *   provider: "sftp",
 *   username: "deploy",
 *   ssh: { privateKey: { path: "./keys/id_ed25519" } },
 * });
 * try {
 *   const list = await session.fs.list("/uploads");
 *   console.log(list);
 * } finally {
 *   await session.disconnect();
 * }
 * ```
 *
 * @example Friendly one-shot helpers
 * ```ts
 * import { uploadFile } from "@zero-transfer/sdk";
 *
 * await uploadFile({
 *   client,
 *   destination: { path: "/uploads/report.csv", profile },
 *   localPath: "./out/report.csv",
 * });
 * ```
 */
export function createTransferClient(options: TransferClientOptions = {}): TransferClient {
  return new TransferClient(options);
}
