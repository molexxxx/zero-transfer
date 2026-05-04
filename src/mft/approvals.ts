/**
 * Approval gates that pause routes until an out-of-band reviewer signs off.
 *
 * Approval requests are pure data records held by an in-memory registry. The
 * {@link ApprovalGate} executor wraps a route runner so dispatch is deferred
 * until {@link ApprovalRegistry.approve} is called. Rejection short-circuits
 * the run with an {@link ApprovalRejectedError}.
 *
 * @module mft/approvals
 */
import { ConfigurationError, ZeroTransferError } from "../errors/ZeroTransferError";
import type { TransferReceipt } from "../transfers/TransferJob";
import type { MftRoute } from "./MftRoute";
import type { ScheduleRouteRunner } from "./MftScheduler";

/** Lifecycle status of an approval request. */
export type ApprovalStatus = "pending" | "approved" | "rejected";

/** Approval request record. */
export interface ApprovalRequest {
  /** Stable approval id. */
  id: string;
  /** Route id awaiting approval. */
  routeId: string;
  /** Wall-clock time at which the request was created. */
  requestedAt: Date;
  /** Current status. */
  status: ApprovalStatus;
  /** Wall-clock time at which the status changed. */
  resolvedAt?: Date;
  /** Identifier of the principal that resolved the request. */
  resolvedBy?: string;
  /** Caller-defined reason recorded with the resolution. */
  reason?: string;
  /** Caller-defined metadata retained for diagnostics. */
  metadata?: Record<string, unknown>;
}

/** Error raised when an approval request is rejected. */
export class ApprovalRejectedError extends ZeroTransferError {
  /**
   * Creates a rejection error.
   *
   * @param request - The rejected approval request.
   */
  constructor(public readonly request: ApprovalRequest) {
    super({
      code: "approval_rejected",
      details: { approvalId: request.id, reason: request.reason, routeId: request.routeId },
      message: `Approval "${request.id}" for route "${request.routeId}" was rejected`,
      retryable: false,
    });
    Object.setPrototypeOf(this, ApprovalRejectedError.prototype);
    this.name = "ApprovalRejectedError";
  }
}

interface PendingResolver {
  resolve: (request: ApprovalRequest) => void;
  reject: (error: unknown) => void;
}

/** In-memory approval registry. */
export class ApprovalRegistry {
  private readonly requests = new Map<string, ApprovalRequest>();
  private readonly pending = new Map<string, PendingResolver>();

  /**
   * Creates a new request and returns a promise that resolves when the request
   * transitions out of `"pending"` state.
   *
   * @param input - Request seed (id, routeId, optional metadata).
   * @param now - Reference clock used to stamp `requestedAt`.
   * @returns The created request and a promise tracking its resolution.
   */
  create(
    input: { id: string; routeId: string; metadata?: Record<string, unknown> },
    now: Date = new Date(),
  ): { request: ApprovalRequest; settled: Promise<ApprovalRequest> } {
    if (input.id.length === 0) {
      throw new ConfigurationError({
        message: "Approval id must be a non-empty string",
        retryable: false,
      });
    }
    if (this.requests.has(input.id)) {
      throw new ConfigurationError({
        details: { approvalId: input.id },
        message: `Approval "${input.id}" already exists`,
        retryable: false,
      });
    }

    const request: ApprovalRequest = {
      id: input.id,
      requestedAt: now,
      routeId: input.routeId,
      status: "pending",
    };
    if (input.metadata !== undefined) request.metadata = input.metadata;
    this.requests.set(input.id, request);

    const settled = new Promise<ApprovalRequest>((resolve, reject) => {
      this.pending.set(input.id, { reject, resolve });
    });

    return { request, settled };
  }

  /**
   * Approves a pending request.
   *
   * @param id - Approval id to resolve.
   * @param input - Optional reviewer identifier and reason.
   * @param now - Reference clock used to stamp `resolvedAt`.
   * @returns The updated approval record.
   */
  approve(
    id: string,
    input: { resolvedBy?: string; reason?: string } = {},
    now: Date = new Date(),
  ): ApprovalRequest {
    return this.resolve(id, "approved", input, now);
  }

  /**
   * Rejects a pending request.
   *
   * @param id - Approval id to resolve.
   * @param input - Optional reviewer identifier and reason.
   * @param now - Reference clock used to stamp `resolvedAt`.
   * @returns The updated approval record.
   */
  reject(
    id: string,
    input: { resolvedBy?: string; reason?: string } = {},
    now: Date = new Date(),
  ): ApprovalRequest {
    const updated = this.resolve(id, "rejected", input, now);
    const resolver = this.pending.get(id);
    if (resolver !== undefined) {
      this.pending.delete(id);
      resolver.reject(new ApprovalRejectedError(updated));
    }
    return updated;
  }

  /** Looks up a request by id. */
  get(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  /** Lists pending requests in insertion order. */
  listPending(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter((request) => request.status === "pending");
  }

  /** Lists every request ever created. */
  list(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  private resolve(
    id: string,
    status: Exclude<ApprovalStatus, "pending">,
    input: { resolvedBy?: string; reason?: string },
    now: Date,
  ): ApprovalRequest {
    const request = this.requests.get(id);
    if (request === undefined) {
      throw new ConfigurationError({
        details: { approvalId: id },
        message: `Approval "${id}" is not registered`,
        retryable: false,
      });
    }

    if (request.status !== "pending") {
      throw new ConfigurationError({
        details: { approvalId: id, status: request.status },
        message: `Approval "${id}" is already ${request.status}`,
        retryable: false,
      });
    }

    request.status = status;
    request.resolvedAt = now;
    if (input.resolvedBy !== undefined) request.resolvedBy = input.resolvedBy;
    if (input.reason !== undefined) request.reason = input.reason;

    if (status === "approved") {
      const resolver = this.pending.get(id);
      if (resolver !== undefined) {
        this.pending.delete(id);
        resolver.resolve(request);
      }
    }

    return request;
  }
}

/** Options accepted by {@link createApprovalGate}. */
export interface CreateApprovalGateOptions {
  /** Registry that holds approval requests. */
  registry: ApprovalRegistry;
  /** Underlying runner that executes the route once approval is granted. */
  runner: ScheduleRouteRunner;
  /** Function that derives an approval id from each route invocation. */
  approvalId: (input: { route: MftRoute }) => string;
  /** Optional clock used for `requestedAt`/`resolvedAt`. */
  now?: () => Date;
  /** Observer fired when a new approval request is created. */
  onRequested?: (request: ApprovalRequest) => void;
}

/**
 * Wraps a route runner with an approval gate.
 *
 * The returned runner creates an approval request, waits for resolution, and
 * dispatches the underlying runner only when the request is approved. Rejection
 * surfaces an {@link ApprovalRejectedError}. Pair with {@link MftScheduler} to
 * implement two-person rules and human-in-the-loop release flows.
 *
 * @param options - Registry, downstream runner, approval-id derivation, hooks.
 * @returns A {@link ScheduleRouteRunner} that gates execution behind approval.
 *
 * @example Two-person rule on a release route
 * ```ts
 * import {
 *   ApprovalRegistry,
 *   createApprovalGate,
 *   runRoute,
 * } from "@zero-transfer/sdk";
 *
 * const approvals = new ApprovalRegistry();
 *
 * const gatedRunner = createApprovalGate({
 *   registry: approvals,
 *   approvalId: ({ route }) => `release:${route.id}:${Date.now()}`,
 *   onRequested: (req) => notifyOnCallChannel(req),
 *   runner: ({ client, route, signal }) => runRoute({ client, route, signal }),
 * });
 *
 * // Elsewhere, an authorized operator approves or rejects:
 * approvals.approve(approvalId, { actor: "alice@example.com" });
 * // approvals.reject(approvalId, { actor: "bob@example.com", reason: "hold release" });
 * ```
 */
export function createApprovalGate(options: CreateApprovalGateOptions): ScheduleRouteRunner {
  const now = options.now ?? (() => new Date());

  return async (input): Promise<TransferReceipt> => {
    const approvalId = options.approvalId({ route: input.route });
    const { request, settled } = options.registry.create(
      { id: approvalId, routeId: input.route.id },
      now(),
    );

    options.onRequested?.(request);

    const onAbort = (): void => {
      const current = options.registry.get(approvalId);
      if (current?.status === "pending") {
        options.registry.reject(approvalId, { reason: "aborted" }, now());
      }
    };

    if (input.signal.aborted) onAbort();
    input.signal.addEventListener("abort", onAbort);

    try {
      await settled;
    } finally {
      input.signal.removeEventListener("abort", onAbort);
    }

    return options.runner(input);
  };
}
