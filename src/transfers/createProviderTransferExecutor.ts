/**
 * Transfer executor bridge for provider-backed read/write sessions.
 *
 * @module transfers/createProviderTransferExecutor
 */
import type { TransferSession } from "../core/TransferSession";
import { ConfigurationError, UnsupportedFeatureError } from "../errors/ZeroTransferError";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../providers/ProviderTransferOperations";
import type { TransferExecutionContext, TransferExecutor } from "./TransferEngine";
import type {
  TransferEndpoint,
  TransferExecutionResult,
  TransferJob,
  TransferOperation,
  TransferVerificationResult,
} from "./TransferJob";

/** Endpoint role used while resolving provider sessions for a transfer job. */
export type ProviderTransferEndpointRole = "source" | "destination";

/** Input passed to provider transfer session resolvers. */
export interface ProviderTransferSessionResolverInput {
  /** Endpoint being resolved. */
  endpoint: TransferEndpoint;
  /** Whether the endpoint is the source or destination side of the transfer. */
  role: ProviderTransferEndpointRole;
  /** Job currently being executed. */
  job: TransferJob;
}

/** Resolves the connected provider session that owns an endpoint. */
export type ProviderTransferSessionResolver = (
  input: ProviderTransferSessionResolverInput,
) => TransferSession | undefined;

/** Options for {@link createProviderTransferExecutor}. */
export interface ProviderTransferExecutorOptions {
  /** Resolves connected provider sessions for source and destination endpoints. */
  resolveSession: ProviderTransferSessionResolver;
}

/**
 * Creates a {@link TransferExecutor} that reads from a source provider and writes to a destination provider.
 *
 * The returned executor supports single-object `upload`, `download`, and `copy` jobs. Provider sessions must
 * expose `session.transfers.read()` and `session.transfers.write()`; concrete providers remain responsible for
 * the actual streaming implementation.
 *
 * @param options - Session resolver used for source and destination endpoints.
 * @returns Transfer executor suitable for {@link TransferEngine.execute} or {@link TransferQueue}.
 */
export function createProviderTransferExecutor(
  options: ProviderTransferExecutorOptions,
): TransferExecutor {
  return async (context) => {
    const { job } = context;

    if (!isReadWriteOperation(job.operation)) {
      throw new UnsupportedFeatureError({
        details: { jobId: job.id, operation: job.operation },
        message: `Provider read/write executor does not support transfer operation: ${job.operation}`,
        retryable: false,
      });
    }

    const source = requireEndpoint(job, "source");
    const destination = requireEndpoint(job, "destination");
    const sourceSession = options.resolveSession({ endpoint: source, job, role: "source" });
    const destinationSession = options.resolveSession({
      endpoint: destination,
      job,
      role: "destination",
    });
    const sourceTransfers = requireTransferOperations(sourceSession, source, "source", job);
    const destinationTransfers = requireTransferOperations(
      destinationSession,
      destination,
      "destination",
      job,
    );

    context.throwIfAborted();
    const readResult = await sourceTransfers.read(createReadRequest(context, source));
    context.throwIfAborted();
    const writeResult = await destinationTransfers.write(
      createWriteRequest(context, destination, readResult),
    );

    return mergeProviderTransferResult(readResult, writeResult, job);
  };
}

function isReadWriteOperation(operation: TransferOperation): boolean {
  return operation === "copy" || operation === "download" || operation === "upload";
}

function requireEndpoint(job: TransferJob, role: ProviderTransferEndpointRole): TransferEndpoint {
  const endpoint = role === "source" ? job.source : job.destination;

  if (endpoint === undefined) {
    throw new ConfigurationError({
      details: { jobId: job.id, operation: job.operation, role },
      message: `Transfer job requires a ${role} endpoint: ${job.id}`,
      retryable: false,
    });
  }

  return endpoint;
}

function requireTransferOperations(
  session: TransferSession | undefined,
  endpoint: TransferEndpoint,
  role: ProviderTransferEndpointRole,
  job: TransferJob,
): ProviderTransferOperations {
  if (session === undefined) {
    throw new UnsupportedFeatureError({
      details: { endpoint: cloneEndpoint(endpoint), jobId: job.id, operation: job.operation, role },
      message: `No provider session resolved for ${role} endpoint: ${endpoint.path}`,
      retryable: false,
    });
  }

  if (session.transfers === undefined) {
    throw new UnsupportedFeatureError({
      details: {
        endpoint: cloneEndpoint(endpoint),
        jobId: job.id,
        operation: job.operation,
        provider: session.provider,
        role,
      },
      message: `Provider session does not expose transfer operations: ${session.provider}`,
      retryable: false,
    });
  }

  return session.transfers;
}

function createReadRequest(
  context: TransferExecutionContext,
  endpoint: TransferEndpoint,
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    attempt: context.attempt,
    endpoint: cloneEndpoint(endpoint),
    job: context.job,
    reportProgress: (bytesTransferred, totalBytes) =>
      context.reportProgress(bytesTransferred, totalBytes),
    throwIfAborted: () => context.throwIfAborted(),
  };

  if (context.signal !== undefined) request.signal = context.signal;
  if (context.bandwidthLimit !== undefined) {
    request.bandwidthLimit = { ...context.bandwidthLimit };
  }

  return request;
}

function createWriteRequest(
  context: TransferExecutionContext,
  endpoint: TransferEndpoint,
  readResult: ProviderTransferReadResult,
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    attempt: context.attempt,
    content: readResult.content,
    endpoint: cloneEndpoint(endpoint),
    job: context.job,
    reportProgress: (bytesTransferred, totalBytes) =>
      context.reportProgress(bytesTransferred, totalBytes),
    throwIfAborted: () => context.throwIfAborted(),
  };
  const totalBytes = readResult.totalBytes ?? context.job.totalBytes;

  if (context.signal !== undefined) request.signal = context.signal;
  if (context.bandwidthLimit !== undefined) {
    request.bandwidthLimit = { ...context.bandwidthLimit };
  }
  if (totalBytes !== undefined) request.totalBytes = totalBytes;
  if (context.job.resumed === true) request.offset = readResult.bytesRead ?? 0;
  if (readResult.verification !== undefined) {
    request.verification = cloneVerification(readResult.verification);
  }

  return request;
}

function mergeProviderTransferResult(
  readResult: ProviderTransferReadResult,
  writeResult: ProviderTransferWriteResult,
  job: TransferJob,
): TransferExecutionResult {
  const result: TransferExecutionResult = {
    bytesTransferred: writeResult.bytesTransferred,
  };
  const totalBytes = writeResult.totalBytes ?? readResult.totalBytes ?? job.totalBytes;
  const warnings = [...(readResult.warnings ?? []), ...(writeResult.warnings ?? [])];

  if (totalBytes !== undefined) result.totalBytes = totalBytes;
  if (writeResult.resumed !== undefined) result.resumed = writeResult.resumed;
  if (writeResult.verified !== undefined) result.verified = writeResult.verified;
  if (writeResult.checksum !== undefined) result.checksum = writeResult.checksum;
  else if (readResult.checksum !== undefined) result.checksum = readResult.checksum;
  if (writeResult.verification !== undefined) {
    result.verification = cloneVerification(writeResult.verification);
  } else if (readResult.verification !== undefined) {
    result.verification = cloneVerification(readResult.verification);
  }
  if (warnings.length > 0) result.warnings = warnings;

  return result;
}

function cloneEndpoint(endpoint: TransferEndpoint): TransferEndpoint {
  const clone: TransferEndpoint = { path: endpoint.path };

  if (endpoint.provider !== undefined) clone.provider = endpoint.provider;

  return clone;
}

function cloneVerification(verification: TransferVerificationResult): TransferVerificationResult {
  const clone: TransferVerificationResult = { verified: verification.verified };

  if (verification.method !== undefined) clone.method = verification.method;
  if (verification.checksum !== undefined) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== undefined) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== undefined) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== undefined) clone.details = { ...verification.details };

  return clone;
}
