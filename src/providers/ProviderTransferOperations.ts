/**
 * Provider-backed transfer read/write contracts.
 *
 * @module providers/ProviderTransferOperations
 */
import type { TransferExecutionContext } from "../transfers/TransferEngine";
import type {
  TransferEndpoint,
  TransferExecutionResult,
  TransferVerificationResult,
} from "../transfers/TransferJob";

/** Binary chunk shape used by provider transfer streams. */
export type TransferDataChunk = Uint8Array;

/** Provider-neutral transfer content source. Node readable streams satisfy this shape. */
export type TransferDataSource = AsyncIterable<TransferDataChunk>;

/** Byte range requested from a readable provider endpoint. */
export interface TransferByteRange {
  /** Zero-based byte offset where reading should begin. */
  offset: number;
  /** Maximum number of bytes to read when known. */
  length?: number;
}

/** Shared provider transfer request fields. */
export interface ProviderTransferRequest extends TransferExecutionContext {
  /** Endpoint owned by the provider handling this request. */
  endpoint: TransferEndpoint;
}

/** Request passed to provider read implementations. */
export interface ProviderTransferReadRequest extends ProviderTransferRequest {
  /** Optional byte range for resumed or partial reads. */
  range?: TransferByteRange;
}

/** Result returned by provider read implementations. */
export interface ProviderTransferReadResult {
  /** Content stream produced by the provider. */
  content: TransferDataSource;
  /** Bytes already read by the provider before returning the content stream, if any. */
  bytesRead?: number;
  /** Expected total bytes for the content stream when known. */
  totalBytes?: number;
  /** Verification details produced while opening or reading the source. */
  verification?: TransferVerificationResult;
  /** Checksum produced while opening or reading the source. */
  checksum?: string;
  /** Non-fatal warnings produced by the read side. */
  warnings?: string[];
}

/** Request passed to provider write implementations. */
export interface ProviderTransferWriteRequest extends ProviderTransferRequest {
  /** Content stream to write to the provider endpoint. */
  content: TransferDataSource;
  /** Expected total bytes for the content stream when known. */
  totalBytes?: number;
  /** Resume offset for partial writes when supported by the provider. */
  offset?: number;
  /** Verification details from the read side that a writer may preserve or compare. */
  verification?: TransferVerificationResult;
}

/** Result returned by provider write implementations. */
export type ProviderTransferWriteResult = TransferExecutionResult;

/** Optional read/write surface exposed by provider sessions that support transfer streaming. */
export interface ProviderTransferOperations {
  /** Opens readable content for a provider endpoint. */
  read(
    request: ProviderTransferReadRequest,
  ): Promise<ProviderTransferReadResult> | ProviderTransferReadResult;
  /** Writes readable content to a provider endpoint. */
  write(
    request: ProviderTransferWriteRequest,
  ): Promise<ProviderTransferWriteResult> | ProviderTransferWriteResult;
}
