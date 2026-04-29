/**
 * @zero-transfer/azure-blob entry point.
 *
 * Azure Blob Storage with SAS-token or AAD bearer auth, ranged downloads,
 * and block-blob uploads. Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/azure-blob
 */
export * from "./core";
export {
  createAzureBlobProviderFactory,
  type AzureBlobProviderOptions,
} from "../providers/cloud/AzureBlobProvider";
