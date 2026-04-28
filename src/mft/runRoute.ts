/**
 * Route executor that dispatches a single transfer through {@link TransferEngine}.
 *
 * `runRoute` opens both endpoints through the supplied {@link TransferClient},
 * builds a {@link TransferJob} with route correlation metadata, and runs the
 * provider read/write executor under retry, abort, progress, timeout, and
 * bandwidth-limit hooks. Sessions are released in `finally` blocks even when
 * the transfer fails, throws, or is aborted.
 *
 * @module mft/runRoute
 */
import type { TransferClient } from "../core/TransferClient";
import type { TransferSession } from "../core/TransferSession";
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferProgressEvent } from "../types/public";
import { createProviderTransferExecutor } from "../transfers/createProviderTransferExecutor";
import { TransferEngine } from "../transfers/TransferEngine";
import type {
  TransferEngineExecuteOptions,
  TransferRetryPolicy,
} from "../transfers/TransferEngine";
import type {
  TransferBandwidthLimit,
  TransferEndpoint,
  TransferJob,
  TransferReceipt,
  TransferTimeoutPolicy,
} from "../transfers/TransferJob";
import type { MftRoute } from "./MftRoute";

/** Options accepted by {@link runRoute}. */
export interface RunRouteOptions {
  /** Transfer client whose registry can resolve both endpoint providers. */
  client: TransferClient;
  /** Route to execute. */
  route: MftRoute;
  /** Optional transfer engine override. A fresh engine is created when omitted. */
  engine?: TransferEngine;
  /** Optional explicit job id. Defaults to a deterministic route-derived id. */
  jobId?: string;
  /** Optional clock used to derive the default job id. Defaults to `Date.now`. */
  now?: () => Date;
  /** Abort signal used to cancel the route execution. */
  signal?: AbortSignal;
  /** Retry policy forwarded to the engine. */
  retry?: TransferRetryPolicy;
  /** Progress observer forwarded to the engine. */
  onProgress?: (event: TransferProgressEvent) => void;
  /** Timeout policy forwarded to the engine. */
  timeout?: TransferTimeoutPolicy;
  /** Optional bandwidth limit forwarded to the engine. */
  bandwidthLimit?: TransferBandwidthLimit;
  /** Caller-defined metadata merged into the resulting transfer job. */
  metadata?: Record<string, unknown>;
}

/**
 * Executes an MFT route as a single transfer through the supplied client.
 *
 * @param options - Client, route, and optional engine/abort/retry hooks.
 * @returns Receipt produced by the underlying transfer engine.
 * @throws {@link ConfigurationError} When the route is disabled.
 */
export async function runRoute(options: RunRouteOptions): Promise<TransferReceipt> {
  const { client, route } = options;

  if (route.enabled === false) {
    throw new ConfigurationError({
      details: { routeId: route.id },
      message: `MFT route "${route.id}" is disabled`,
      retryable: false,
    });
  }

  const sourceSession = await client.connect(route.source.profile);

  let destinationSession: TransferSession | undefined;
  try {
    destinationSession = await client.connect(route.destination.profile);
    const engine = options.engine ?? new TransferEngine();
    const job = createRouteJob(route, sourceSession, destinationSession, options);
    const sessions = new Map<string, TransferSession>([
      ["source", sourceSession],
      ["destination", destinationSession],
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ role }) => sessions.get(role),
    });

    return await engine.execute(job, executor, buildExecuteOptions(options));
  } finally {
    if (destinationSession !== undefined) {
      await destinationSession.disconnect();
    }
    await sourceSession.disconnect();
  }
}

function createRouteJob(
  route: MftRoute,
  sourceSession: TransferSession,
  destinationSession: TransferSession,
  options: RunRouteOptions,
): TransferJob {
  const operation = route.operation ?? "copy";
  const source: TransferEndpoint = {
    path: route.source.path,
    provider: sourceSession.provider,
  };
  const destination: TransferEndpoint = {
    path: route.destination.path,
    provider: destinationSession.provider,
  };

  const baseMetadata: Record<string, unknown> = { routeId: route.id };
  if (route.name !== undefined) baseMetadata["routeName"] = route.name;
  if (route.metadata !== undefined) Object.assign(baseMetadata, route.metadata);
  if (options.metadata !== undefined) Object.assign(baseMetadata, options.metadata);

  const job: TransferJob = {
    destination,
    id: options.jobId ?? defaultJobId(route, options.now),
    operation,
    source,
  };

  if (Object.keys(baseMetadata).length > 0) {
    job.metadata = baseMetadata;
  }

  return job;
}

function defaultJobId(route: MftRoute, now: (() => Date) | undefined): string {
  const timestamp = (now?.() ?? new Date()).getTime();
  return `route:${route.id}:${timestamp.toString(36)}`;
}

function buildExecuteOptions(options: RunRouteOptions): TransferEngineExecuteOptions {
  const execute: TransferEngineExecuteOptions = {};
  if (options.signal !== undefined) execute.signal = options.signal;
  if (options.retry !== undefined) execute.retry = options.retry;
  if (options.onProgress !== undefined) execute.onProgress = options.onProgress;
  if (options.timeout !== undefined) execute.timeout = options.timeout;
  if (options.bandwidthLimit !== undefined) execute.bandwidthLimit = options.bandwidthLimit;
  return execute;
}
