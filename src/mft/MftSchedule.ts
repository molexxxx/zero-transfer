/**
 * MFT schedule triggers and definitions.
 *
 * Schedules are pure data describing when a route should fire. The
 * {@link nextScheduleFireAt} helper turns a schedule into the next concrete
 * fire time so {@link MftScheduler} can stay clock-injectable and testable.
 *
 * @module mft/MftSchedule
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import { nextCronFireAt, parseCronExpression, type CronExpression } from "./cron";

/** Repeats every `everyMs` milliseconds from a fixed reference point. */
export interface IntervalScheduleTrigger {
  /** Discriminator. */
  kind: "interval";
  /** Period between fires in milliseconds. Must be a positive finite number. */
  everyMs: number;
  /**
   * Reference time used to anchor the interval. Defaults to the scheduler start time.
   * Fires occur at `anchor + n * everyMs` for the smallest `n` strictly after `from`.
   */
  anchor?: Date;
}

/** Fires at times matching a 5-field cron expression (minute hour dom month dow). */
export interface CronScheduleTrigger {
  /** Discriminator. */
  kind: "cron";
  /** 5-field cron expression: `minute hour day-of-month month day-of-week`. */
  expression: string;
  /** Timezone interpretation. Defaults to `"utc"`. */
  timezone?: "utc" | "local";
}

/** Combined trigger union accepted by {@link MftSchedule}. */
export type MftScheduleTrigger = IntervalScheduleTrigger | CronScheduleTrigger;

/** Declarative schedule binding a route id to a trigger. */
export interface MftSchedule {
  /** Stable schedule identifier. */
  id: string;
  /** Route id the schedule fires through {@link runRoute}. */
  routeId: string;
  /** Trigger definition. */
  trigger: MftScheduleTrigger;
  /** Whether the schedule is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Caller-defined metadata retained for audit records and diagnostics. */
  metadata?: Record<string, unknown>;
}

interface CompiledCronTrigger {
  kind: "cron";
  expression: CronExpression;
  timezone: "utc" | "local";
}

interface CompiledIntervalTrigger {
  kind: "interval";
  everyMs: number;
  anchor: Date | undefined;
}

type CompiledTrigger = CompiledCronTrigger | CompiledIntervalTrigger;

/**
 * Validates a schedule and returns it for fluent setup.
 *
 * @param schedule - Schedule to validate.
 * @returns The same schedule instance.
 * @throws {@link ConfigurationError} When the schedule is malformed.
 */
export function validateSchedule(schedule: MftSchedule): MftSchedule {
  if (schedule.id.length === 0) {
    throw new ConfigurationError({
      message: "MFT schedule id must be a non-empty string",
      retryable: false,
    });
  }

  if (schedule.routeId.length === 0) {
    throw new ConfigurationError({
      details: { scheduleId: schedule.id },
      message: "MFT schedule must reference a non-empty route id",
      retryable: false,
    });
  }

  compileTrigger(schedule);
  return schedule;
}

/**
 * Computes the next fire time for a schedule strictly after `from`.
 *
 * @param schedule - Schedule whose next fire time should be computed.
 * @param from - Reference time. Defaults to the current wall clock.
 * @returns The next fire time, or `undefined` when no future fire exists.
 */
export function nextScheduleFireAt(
  schedule: MftSchedule,
  from: Date = new Date(),
): Date | undefined {
  const trigger = compileTrigger(schedule);

  if (trigger.kind === "interval") {
    return nextIntervalFireAt(trigger, from);
  }

  return nextCronFireAt(trigger.expression, from, trigger.timezone);
}

function compileTrigger(schedule: MftSchedule): CompiledTrigger {
  const trigger = schedule.trigger;

  if (trigger.kind === "interval") {
    if (!Number.isFinite(trigger.everyMs) || trigger.everyMs <= 0) {
      throw new ConfigurationError({
        details: { scheduleId: schedule.id },
        message: "MFT interval schedule everyMs must be a positive finite number",
        retryable: false,
      });
    }

    return { anchor: trigger.anchor, everyMs: trigger.everyMs, kind: "interval" };
  }

  return {
    expression: parseCronExpression(trigger.expression),
    kind: "cron",
    timezone: trigger.timezone ?? "utc",
  };
}

function nextIntervalFireAt(trigger: CompiledIntervalTrigger, from: Date): Date {
  const fromMs = from.getTime();
  const anchor = trigger.anchor?.getTime() ?? fromMs;
  if (anchor > fromMs) return new Date(anchor);
  const elapsed = fromMs - anchor;
  const cycles = Math.floor(elapsed / trigger.everyMs) + 1;
  return new Date(anchor + cycles * trigger.everyMs);
}
