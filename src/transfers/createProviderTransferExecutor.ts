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
import type { RemoteStat } from "../types/public";
import {
  createBandwidthThrottle,
  throttleByteIterable,
  type BandwidthThrottleOptions,
} from "./BandwidthThrottle";
import {
  fingerprintsMatch,
  type TransferCheckpointHandle,
  type TransferCheckpointKey,
  type TransferCheckpointRecord,
  type TransferCheckpointState,
  type TransferCheckpointStore,
  type TransferSourceFingerprint,
} from "./TransferCheckpointStore";
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

/**
 * Resume behavior for a transfer.
 *
 * - `"auto"` (default) - resume when both endpoints are capable
 *   (`resumeDownload` on the source, `resumeUpload` on the destination) and a
 *   valid checkpoint exists; otherwise transfer from scratch.
 * - `"require"` - throw {@link UnsupportedFeatureError} when either endpoint
 *   cannot resume, instead of silently restarting.
 * - `"off"` - never consult or write checkpoints.
 */
export type TransferResumeMode = "auto" | "require" | "off";

/**
 * Checkpoint/resume configuration consumed by
 * {@link createProviderTransferExecutor} (directly or through
 * {@link runRoute} / client defaults).
 *
 * @example Cross-process resumable transfers
 * ```ts
 * import {
 *   createFileSystemTransferCheckpointStore,
 *   createProviderTransferExecutor,
 * } from "@zero-transfer/sdk";
 *
 * const executor = createProviderTransferExecutor({
 *   resolveSession,
 *   resume: {
 *     store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
 *   },
 * });
 * ```
 */
export interface TransferResumeOptions {
  /** Checkpoint persistence backend. */
  store: TransferCheckpointStore;
  /** Resume behavior. Defaults to `"auto"`. */
  mode?: TransferResumeMode;
  /**
   * Minimum bytes of new committed progress between byte-offset checkpoint
   * persists. Defaults to 8 MiB. Part-aware providers persist per committed
   * part instead and ignore this value.
   */
  persistIntervalBytes?: number;
  /**
   * Optional namespace mixed into checkpoint keys. Checkpoints are keyed by
   * source+destination provider/path; set a scope (for example the host or
   * profile id) when identical provider/path pairs can refer to different
   * servers.
   */
  scope?: string;
}

/** Options for {@link createProviderTransferExecutor}. */
export interface ProviderTransferExecutorOptions {
  /** Resolves connected provider sessions for source and destination endpoints. */
  resolveSession: ProviderTransferSessionResolver;
  /** Optional clock/sleep overrides for the bandwidth throttle. */
  throttle?: BandwidthThrottleOptions;
  /** Checkpoint/resume configuration. Resume is disabled when omitted. */
  resume?: TransferResumeOptions;
}

const DEFAULT_PERSIST_INTERVAL_BYTES = 8 * 1024 * 1024;
const CONCURRENT_WRITER_WINDOW_MS = 60_000;

/**
 * Creates a {@link TransferExecutor} that reads from a source provider and writes to a destination provider.
 *
 * The returned executor supports single-object `upload`, `download`, and `copy` jobs. Provider sessions must
 * expose `session.transfers.read()` and `session.transfers.write()`; concrete providers remain responsible for
 * the actual streaming implementation.
 *
 * When {@link ProviderTransferExecutorOptions.resume} is configured the
 * executor checkpoints progress against the supplied store and resumes
 * interrupted transfers: the source is fingerprinted (size/mtime/etag) and a
 * stored checkpoint is honored only when the fingerprint still matches and the
 * destination passes a size sanity check. Engine retries resume in-process for
 * free, and a fresh process resumes through the same store. Checkpoints are
 * cleared on success and invalidated checkpoints trigger best-effort
 * provider-side cleanup via
 * {@link ProviderTransferOperations.discardResumable}.
 *
 * @param options - Session resolver plus optional throttle and resume configuration.
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
    const sourceSession = requireSession(
      options.resolveSession({ endpoint: source, job, role: "source" }),
      source,
      "source",
      job,
    );
    const destinationSession = requireSession(
      options.resolveSession({ endpoint: destination, job, role: "destination" }),
      destination,
      "destination",
      job,
    );
    const sourceTransfers = requireTransferOperations(sourceSession, source, "source", job);
    const destinationTransfers = requireTransferOperations(
      destinationSession,
      destination,
      "destination",
      job,
    );

    context.throwIfAborted();
    const resume = await prepareResume(
      options.resume,
      context,
      source,
      destination,
      sourceSession,
      destinationSession,
      destinationTransfers,
    );

    context.throwIfAborted();
    const readResult = await sourceTransfers.read(createReadRequest(context, source, resume));
    context.throwIfAborted();
    const throttledReadResult = applyBandwidthThrottle(readResult, context, options.throttle);

    let writeResult: ProviderTransferWriteResult;
    try {
      writeResult = await destinationTransfers.write(
        createWriteRequest(context, destination, throttledReadResult, resume),
      );
    } catch (error) {
      // Persist the last observed watermark so the next attempt (in-process
      // retry or a future run) resumes as far forward as possible.
      if (resume !== undefined) await resume.flushOnFailure();
      throw error;
    }

    if (resume !== undefined) await resume.completed();

    return mergeProviderTransferResult(readResult, writeResult, job, resume);
  };
}

/** Live resume context for a single execution attempt. */
interface ResumePlan {
  /** Bytes already committed at the destination; read skips them, write appends after them. */
  committedBytes: number;
  /** Checkpoint handle attached to the write request for part-aware providers. */
  handle: TransferCheckpointHandle;
  /** Byte-offset commit observer wired into the write request. */
  onBytesCommitted: (committedBytes: number) => void;
  /** Drains pending checkpoint writes and clears the checkpoint after success. */
  completed: () => Promise<void>;
  /** Flushes the latest watermark after a failed write (best effort). */
  flushOnFailure: () => Promise<void>;
  /** Non-fatal warnings produced while preparing resume. */
  warnings: string[];
}

async function prepareResume(
  resume: TransferResumeOptions | undefined,
  context: TransferExecutionContext,
  source: TransferEndpoint,
  destination: TransferEndpoint,
  sourceSession: TransferSession,
  destinationSession: TransferSession,
  destinationTransfers: ProviderTransferOperations,
): Promise<ResumePlan | undefined> {
  if (resume === undefined || resume.mode === "off") return undefined;

  const capable =
    sourceSession.capabilities.resumeDownload && destinationSession.capabilities.resumeUpload;
  if (!capable) {
    if (resume.mode === "require") {
      throw new UnsupportedFeatureError({
        details: {
          destinationProvider: destinationSession.provider,
          jobId: context.job.id,
          resumeDownload: sourceSession.capabilities.resumeDownload,
          resumeUpload: destinationSession.capabilities.resumeUpload,
          sourceProvider: sourceSession.provider,
        },
        message:
          "Transfer resume was required but the endpoints do not support it " +
          `(source resumeDownload=${String(sourceSession.capabilities.resumeDownload)}, ` +
          `destination resumeUpload=${String(destinationSession.capabilities.resumeUpload)})`,
        retryable: false,
      });
    }
    return undefined;
  }

  const key: TransferCheckpointKey = {
    destination: {
      path: destination.path,
      ...(destination.provider !== undefined ? { provider: destination.provider } : {}),
    },
    source: {
      path: source.path,
      ...(source.provider !== undefined ? { provider: source.provider } : {}),
    },
    ...(resume.scope !== undefined ? { scope: resume.scope } : {}),
  };

  const sourceStat = await statOrUndefined(sourceSession, source.path);
  if (sourceStat === undefined) {
    // Source unreadable: the subsequent read() will surface the real error.
    return undefined;
  }
  const fingerprint = createFingerprint(sourceStat);

  const warnings: string[] = [];
  const record = await resume.store.load(key);
  let validState: TransferCheckpointState | undefined;

  if (record !== undefined) {
    if (fingerprintsMatch(record.fingerprint, fingerprint)) {
      validState = record.state;
      if (
        record.pid !== process.pid &&
        Date.now() - record.updatedAtMs < CONCURRENT_WRITER_WINDOW_MS
      ) {
        warnings.push(
          `Resume checkpoint was updated ${String(Date.now() - record.updatedAtMs)}ms ago by another process ` +
            `(pid ${String(record.pid)}); concurrent transfers to the same destination may conflict`,
        );
      }
    } else {
      await invalidateCheckpoint(
        resume.store,
        key,
        record,
        destination,
        destinationTransfers,
        context.signal,
      );
    }
  }

  let committedBytes = 0;
  if (validState !== undefined) {
    committedBytes = validState.committedBytes;

    if (validState.kind === "byte-offset" && committedBytes > 0) {
      // Sanity trim: never trust a watermark beyond what the destination
      // actually holds, and restart when the partial destination vanished.
      const destinationStat = await statOrUndefined(destinationSession, destination.path);
      if (destinationStat === undefined) {
        await invalidateCheckpoint(
          resume.store,
          key,
          record,
          destination,
          destinationTransfers,
          context.signal,
        );
        validState = undefined;
        committedBytes = 0;
      } else {
        committedBytes = Math.min(committedBytes, destinationStat.size ?? 0);
      }
    }

    if (fingerprint.sizeBytes !== undefined) {
      committedBytes = Math.min(committedBytes, fingerprint.sizeBytes);
    }
    if (committedBytes <= 0 && validState !== undefined && validState.kind === "byte-offset") {
      validState = undefined;
      committedBytes = 0;
    }
  }

  const createdAtMs = record?.createdAtMs;
  const buildRecord = (state: TransferCheckpointState): TransferCheckpointRecord => {
    const nowMs = Date.now();
    return {
      createdAtMs: createdAtMs ?? nowMs,
      fingerprint,
      pid: process.pid,
      state,
      updatedAtMs: nowMs,
      version: 1,
    };
  };

  const handle: TransferCheckpointHandle = {
    clear: async () => {
      await resume.store.clear(key);
    },
    save: async (state) => {
      await resume.store.save(key, buildRecord(state));
    },
    ...(validState !== undefined ? { state: validState } : {}),
  };

  // Coalescing byte-offset persister: the hot path never awaits the store;
  // overlapping saves collapse to the latest watermark.
  const persistInterval = normalizePersistInterval(resume.persistIntervalBytes);
  let highestCommitted = committedBytes;
  let persistedBytes = committedBytes;
  let saveChain: Promise<void> = Promise.resolve();
  let usedByteOffsetCommits = false;

  const persistWatermark = (committed: number): void => {
    saveChain = saveChain
      .then(() =>
        resume.store.save(key, buildRecord({ committedBytes: committed, kind: "byte-offset" })),
      )
      .then(() => {
        persistedBytes = Math.max(persistedBytes, committed);
      })
      .catch(() => undefined);
  };

  const onBytesCommitted = (committed: number): void => {
    if (!Number.isFinite(committed) || committed <= highestCommitted) return;
    highestCommitted = committed;
    usedByteOffsetCommits = true;
    if (committed - persistedBytes >= persistInterval) {
      persistedBytes = committed;
      persistWatermark(committed);
    }
  };

  return {
    committedBytes,
    completed: async () => {
      await saveChain;
      await resume.store.clear(key);
    },
    flushOnFailure: async () => {
      try {
        if (usedByteOffsetCommits && highestCommitted > persistedBytes) {
          persistWatermark(highestCommitted);
        }
        await saveChain;
      } catch {
        // Best effort: the original transfer failure must propagate.
      }
    },
    handle,
    onBytesCommitted,
    warnings,
  };
}

async function invalidateCheckpoint(
  store: TransferCheckpointStore,
  key: TransferCheckpointKey,
  record: TransferCheckpointRecord | undefined,
  destination: TransferEndpoint,
  destinationTransfers: ProviderTransferOperations,
  signal: AbortSignal | undefined,
): Promise<void> {
  await store.clear(key);
  if (record === undefined || destinationTransfers.discardResumable === undefined) return;
  try {
    await destinationTransfers.discardResumable({
      endpoint: cloneEndpoint(destination),
      state: record.state,
      ...(signal !== undefined ? { signal } : {}),
    });
  } catch {
    // Best effort: orphaned provider state expires on its own (S3/Azure TTL).
  }
}

async function statOrUndefined(
  session: TransferSession,
  path: string,
): Promise<RemoteStat | undefined> {
  try {
    return await session.fs.stat(path);
  } catch {
    return undefined;
  }
}

function createFingerprint(stat: RemoteStat): TransferSourceFingerprint {
  const fingerprint: TransferSourceFingerprint = {};
  if (stat.size !== undefined) fingerprint.sizeBytes = stat.size;
  if (stat.modifiedAt !== undefined) fingerprint.modifiedAtMs = stat.modifiedAt.getTime();
  if (stat.uniqueId !== undefined) fingerprint.etag = stat.uniqueId;
  return fingerprint;
}

function normalizePersistInterval(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_PERSIST_INTERVAL_BYTES;
  }
  return Math.floor(value);
}

function applyBandwidthThrottle(
  readResult: ProviderTransferReadResult,
  context: TransferExecutionContext,
  options: BandwidthThrottleOptions | undefined,
): ProviderTransferReadResult {
  const throttle = createBandwidthThrottle(context.bandwidthLimit, options);

  if (throttle === undefined) return readResult;

  return {
    ...readResult,
    content: throttleByteIterable(readResult.content, throttle, context.signal),
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

function requireSession(
  session: TransferSession | undefined,
  endpoint: TransferEndpoint,
  role: ProviderTransferEndpointRole,
  job: TransferJob,
): TransferSession {
  if (session === undefined) {
    throw new UnsupportedFeatureError({
      details: { endpoint: cloneEndpoint(endpoint), jobId: job.id, operation: job.operation, role },
      message: `No provider session resolved for ${role} endpoint: ${endpoint.path}`,
      retryable: false,
    });
  }

  return session;
}

function requireTransferOperations(
  session: TransferSession,
  endpoint: TransferEndpoint,
  role: ProviderTransferEndpointRole,
  job: TransferJob,
): ProviderTransferOperations {
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
  resume: ResumePlan | undefined,
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
  if (resume !== undefined && resume.committedBytes > 0) {
    request.range = { offset: resume.committedBytes };
  }

  return request;
}

function createWriteRequest(
  context: TransferExecutionContext,
  endpoint: TransferEndpoint,
  readResult: ProviderTransferReadResult,
  resume: ResumePlan | undefined,
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
  if (resume !== undefined) {
    if (resume.committedBytes > 0) request.offset = resume.committedBytes;
    request.checkpoint = resume.handle;
    request.onBytesCommitted = resume.onBytesCommitted;
  } else if (context.job.resumed === true) {
    request.offset = readResult.bytesRead ?? 0;
  }
  if (readResult.verification !== undefined) {
    request.verification = cloneVerification(readResult.verification);
  }

  return request;
}

function mergeProviderTransferResult(
  readResult: ProviderTransferReadResult,
  writeResult: ProviderTransferWriteResult,
  job: TransferJob,
  resume: ResumePlan | undefined,
): TransferExecutionResult {
  const result: TransferExecutionResult = {
    bytesTransferred: writeResult.bytesTransferred,
  };
  const totalBytes = writeResult.totalBytes ?? readResult.totalBytes ?? job.totalBytes;
  const warnings = [
    ...(resume?.warnings ?? []),
    ...(readResult.warnings ?? []),
    ...(writeResult.warnings ?? []),
  ];

  if (totalBytes !== undefined) result.totalBytes = totalBytes;
  if (resume !== undefined && resume.committedBytes > 0) result.resumed = true;
  else if (writeResult.resumed !== undefined) result.resumed = writeResult.resumed;
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
