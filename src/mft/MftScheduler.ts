/**
 * Schedule runner that fires MFT routes through {@link runRoute} on a clock.
 *
 * The scheduler is timer-injectable so unit tests can drive it deterministically.
 * It watches the configured {@link ScheduleRegistry}, computes the next fire time
 * per schedule via {@link nextScheduleFireAt}, and dispatches matched routes
 * through the supplied runner. Failures from individual fires are surfaced via
 * `onError` and never abort the loop.
 *
 * @module mft/MftScheduler
 */
import type { TransferClient } from "../core/TransferClient";
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { TransferReceipt } from "../transfers/TransferJob";
import type { MftRoute } from "./MftRoute";
import { nextScheduleFireAt, type MftSchedule } from "./MftSchedule";
import type { RouteRegistry } from "./RouteRegistry";
import { runRoute, type RunRouteOptions } from "./runRoute";
import type { ScheduleRegistry } from "./ScheduleRegistry";

/** Function shape used to fire a route. Defaults to {@link runRoute}. */
export type ScheduleRouteRunner = (input: {
  client: TransferClient;
  route: MftRoute;
  schedule: MftSchedule;
  signal: AbortSignal;
}) => Promise<TransferReceipt>;

/** Timer hooks injected by tests so fake clocks stay deterministic. */
export interface ScheduleTimerHooks {
  /** Returns the current wall-clock time. Defaults to `() => new Date()`. */
  now?: () => Date;
  /** Schedules a one-shot callback after `delayMs`. Defaults to `setTimeout`. */
  setTimer?: (callback: () => void, delayMs: number) => unknown;
  /** Cancels a pending timer handle returned by `setTimer`. Defaults to `clearTimeout`. */
  clearTimer?: (handle: unknown) => void;
}

/** Construction options for {@link MftScheduler}. */
export interface MftSchedulerOptions {
  /** Transfer client passed to each fired route. */
  client: TransferClient;
  /** Routes registry resolved by `route id`. */
  routes: RouteRegistry;
  /** Schedules registry watched by the scheduler. */
  schedules: ScheduleRegistry;
  /** Optional runner override. Defaults to invoking {@link runRoute}. */
  runner?: ScheduleRouteRunner;
  /** Observer fired before each route is dispatched. */
  onFire?: (input: { schedule: MftSchedule; firedAt: Date }) => void;
  /** Observer fired after a successful route execution. */
  onResult?: (input: { schedule: MftSchedule; receipt: TransferReceipt }) => void;
  /** Observer fired when a single route fire fails. */
  onError?: (input: { schedule: MftSchedule; error: unknown }) => void;
  /** Timer/clock injection used by tests. */
  timer?: ScheduleTimerHooks;
}

interface ActiveTimer {
  handle: unknown;
  scheduleId: string;
}

/**
 * Runs routes on configured schedules.
 *
 * Subscribes to a {@link ScheduleRegistry}, computes the next fire time for
 * each schedule (cron or interval), and dispatches the matching route through
 * a runner of your choice (`runRoute` by default, or a wrapped runner for
 * approvals / rate limiting / circuit breaking). Observers fire on each cycle
 * for telemetry. Tests can inject a deterministic timer via `timer`.
 *
 * @example Wire a cron schedule with audit + approval
 * ```ts
 * import {
 *   ApprovalRegistry,
 *   InMemoryAuditLog,
 *   MftScheduler,
 *   RouteRegistry,
 *   ScheduleRegistry,
 *   createApprovalGate,
 *   runRoute,
 * } from "@zero-transfer/sdk";
 *
 * const audit = new InMemoryAuditLog();
 * const approvals = new ApprovalRegistry();
 *
 * const scheduler = new MftScheduler({
 *   client,
 *   routes: new RouteRegistry([route]),
 *   schedules: new ScheduleRegistry([
 *     { id: "nightly", routeId: route.id, cron: "0 2 * * *" },
 *   ]),
 *   runner: createApprovalGate({
 *     registry: approvals,
 *     approvalId: ({ route }) => `release:${route.id}`,
 *     runner: ({ client: c, route: r, signal }) => runRoute({ client: c, route: r, signal }),
 *   }),
 *   onResult: ({ receipt }) => audit.record({ type: "transfer.success", receipt }),
 *   onError:  ({ error })   => audit.record({ type: "transfer.failure", error }),
 * });
 *
 * scheduler.start();
 * ```
 */
export class MftScheduler {
  private readonly options: MftSchedulerOptions;
  private readonly now: () => Date;
  private readonly setTimer: NonNullable<ScheduleTimerHooks["setTimer"]>;
  private readonly clearTimer: NonNullable<ScheduleTimerHooks["clearTimer"]>;
  private readonly timers = new Map<string, ActiveTimer>();
  private readonly inflight = new Map<string, AbortController>();
  private running = false;
  private startedAt: Date | undefined;

  /**
   * Creates a scheduler bound to a transfer client and registries.
   *
   * @param options - Client, registries, optional runner, observers, and timer hooks.
   */
  constructor(options: MftSchedulerOptions) {
    this.options = options;
    this.now = options.timer?.now ?? (() => new Date());
    this.setTimer =
      options.timer?.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.clearTimer =
      options.timer?.clearTimer ??
      ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
  }

  /** Whether the scheduler is currently running. */
  get isRunning(): boolean {
    return this.running;
  }

  /** Starts the scheduler. No-op when already running. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.startedAt = this.now();

    for (const schedule of this.options.schedules.list()) {
      this.scheduleNextFire(schedule);
    }
  }

  /**
   * Stops the scheduler and aborts in-flight route executions.
   *
   * @returns A promise that resolves once all in-flight fires have settled.
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    this.startedAt = undefined;

    for (const timer of this.timers.values()) {
      this.clearTimer(timer.handle);
    }
    this.timers.clear();

    const controllers = Array.from(this.inflight.values());
    for (const controller of controllers) {
      controller.abort();
    }

    await Promise.resolve();
  }

  private scheduleNextFire(schedule: MftSchedule): void {
    if (!this.running) return;
    if (schedule.enabled === false) return;

    const now = this.now();
    const reference = schedule.trigger.kind === "interval" ? (this.startedAt ?? now) : now;
    const fireAt = nextScheduleFireAt(
      schedule.trigger.kind === "interval" ? withIntervalAnchor(schedule, reference) : schedule,
      now,
    );

    if (fireAt === undefined) return;

    const delayMs = Math.max(0, fireAt.getTime() - now.getTime());
    const handle = this.setTimer(() => {
      this.timers.delete(schedule.id);
      void this.fire(schedule, fireAt);
    }, delayMs);

    this.timers.set(schedule.id, { handle, scheduleId: schedule.id });
  }

  private async fire(schedule: MftSchedule, firedAt: Date): Promise<void> {
    if (!this.running) return;

    const route = this.options.routes.get(schedule.routeId);
    if (route === undefined) {
      this.options.onError?.({
        error: new ConfigurationError({
          details: { routeId: schedule.routeId, scheduleId: schedule.id },
          message: `MFT schedule "${schedule.id}" references unregistered route "${schedule.routeId}"`,
          retryable: false,
        }),
        schedule,
      });
      this.scheduleNextFire(schedule);
      return;
    }

    const controller = new AbortController();
    this.inflight.set(schedule.id, controller);
    this.options.onFire?.({ firedAt, schedule });

    try {
      const runner = this.options.runner ?? defaultRunner;
      const receipt = await runner({
        client: this.options.client,
        route,
        schedule,
        signal: controller.signal,
      });
      this.options.onResult?.({ receipt, schedule });
    } catch (error) {
      this.options.onError?.({ error, schedule });
    } finally {
      this.inflight.delete(schedule.id);
      this.scheduleNextFire(schedule);
    }
  }
}

function withIntervalAnchor(schedule: MftSchedule, reference: Date): MftSchedule {
  if (schedule.trigger.kind !== "interval" || schedule.trigger.anchor !== undefined) {
    return schedule;
  }
  return {
    ...schedule,
    trigger: { ...schedule.trigger, anchor: reference },
  };
}

const defaultRunner: ScheduleRouteRunner = ({ client, route, signal }) => {
  const options: RunRouteOptions = { client, route, signal };
  return runRoute(options);
};
