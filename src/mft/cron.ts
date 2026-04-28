/**
 * Minimal 5-field cron parser used by MFT schedules.
 *
 * The grammar supports `*`, `*\/N` step values, `A-B` ranges, comma-separated lists,
 * and integer literals on five fields: `minute hour day-of-month month day-of-week`.
 * Day-of-week accepts both `0` and `7` for Sunday. Names (`MON`, `JAN`, ...) and
 * special characters (`L`, `W`, `#`) are intentionally not supported.
 *
 * @module mft/cron
 */
import { ConfigurationError } from "../errors/ZeroTransferError";

/** Compiled cron field as a sorted set of allowed integer values. */
export type CronField = readonly number[];

/** Compiled cron expression. */
export interface CronExpression {
  /** Minutes 0-59. */
  minute: CronField;
  /** Hours 0-23. */
  hour: CronField;
  /** Days of month 1-31. */
  dayOfMonth: CronField;
  /** Months 1-12. */
  month: CronField;
  /** Days of week 0-6 (Sunday = 0). */
  dayOfWeek: CronField;
  /** Whether day-of-month was specified explicitly. */
  hasDomConstraint: boolean;
  /** Whether day-of-week was specified explicitly. */
  hasDowConstraint: boolean;
}

/**
 * Parses a 5-field cron expression.
 *
 * @param expression - Whitespace-separated 5-field cron expression.
 * @returns Compiled representation usable by {@link nextCronFireAt}.
 * @throws {@link ConfigurationError} When the expression is malformed.
 */
export function parseCronExpression(expression: string): CronExpression {
  const fields = expression.trim().split(/\s+/u);

  if (fields.length !== 5) {
    throw new ConfigurationError({
      details: { expression },
      message: "MFT cron expression must have 5 fields: minute hour dom month dow",
      retryable: false,
    });
  }

  const [minuteRaw, hourRaw, domRaw, monthRaw, dowRaw] = fields as [
    string,
    string,
    string,
    string,
    string,
  ];

  return {
    dayOfMonth: parseField(domRaw, 1, 31, "day-of-month", expression),
    dayOfWeek: normalizeDayOfWeek(parseField(dowRaw, 0, 7, "day-of-week", expression)),
    hasDomConstraint: domRaw !== "*",
    hasDowConstraint: dowRaw !== "*",
    hour: parseField(hourRaw, 0, 23, "hour", expression),
    minute: parseField(minuteRaw, 0, 59, "minute", expression),
    month: parseField(monthRaw, 1, 12, "month", expression),
  };
}

/**
 * Computes the next time at which a cron expression fires strictly after `from`.
 *
 * @param expression - Compiled cron expression.
 * @param from - Reference time.
 * @param timezone - Either `"utc"` or `"local"`. Defaults to `"utc"`.
 * @returns The next fire time, or `undefined` when no fire occurs within five years.
 */
export function nextCronFireAt(
  expression: CronExpression,
  from: Date,
  timezone: "utc" | "local" = "utc",
): Date | undefined {
  const utc = timezone === "utc";
  const start = new Date(from.getTime() + 60_000 - (from.getTime() % 60_000));
  const limit = start.getTime() + 5 * 365 * 24 * 60 * 60 * 1000;

  let candidate = start;
  while (candidate.getTime() <= limit) {
    const minute = utc ? candidate.getUTCMinutes() : candidate.getMinutes();
    const hour = utc ? candidate.getUTCHours() : candidate.getHours();
    const dom = utc ? candidate.getUTCDate() : candidate.getDate();
    const month = (utc ? candidate.getUTCMonth() : candidate.getMonth()) + 1;
    const dow = utc ? candidate.getUTCDay() : candidate.getDay();

    if (
      expression.minute.includes(minute) &&
      expression.hour.includes(hour) &&
      expression.month.includes(month) &&
      matchesDayOfMonthAndWeek(expression, dom, dow)
    ) {
      return candidate;
    }

    candidate = new Date(candidate.getTime() + 60_000);
  }

  return undefined;
}

function matchesDayOfMonthAndWeek(expression: CronExpression, dom: number, dow: number): boolean {
  const domMatch = expression.dayOfMonth.includes(dom);
  const dowMatch = expression.dayOfWeek.includes(dow);

  if (expression.hasDomConstraint && expression.hasDowConstraint) {
    return domMatch || dowMatch;
  }

  return domMatch && dowMatch;
}

function parseField(
  raw: string,
  min: number,
  max: number,
  name: string,
  expression: string,
): CronField {
  const values = new Set<number>();

  for (const part of raw.split(",")) {
    const stepSplit = part.split("/");
    if (stepSplit.length > 2) {
      throw createCronError(name, expression);
    }

    const range = stepSplit[0] ?? "";
    const stepRaw = stepSplit[1];
    const step = stepRaw === undefined ? 1 : parseStep(stepRaw, name, expression);

    let rangeStart: number;
    let rangeEnd: number;

    if (range === "*") {
      rangeStart = min;
      rangeEnd = max;
    } else if (range.includes("-")) {
      const [startRaw, endRaw] = range.split("-");
      rangeStart = parseInt(startRaw ?? "", 10);
      rangeEnd = parseInt(endRaw ?? "", 10);
    } else {
      rangeStart = parseInt(range, 10);
      rangeEnd = stepRaw === undefined ? rangeStart : max;
    }

    if (
      !Number.isFinite(rangeStart) ||
      !Number.isFinite(rangeEnd) ||
      rangeStart < min ||
      rangeEnd > max ||
      rangeStart > rangeEnd
    ) {
      throw createCronError(name, expression);
    }

    for (let value = rangeStart; value <= rangeEnd; value += step) {
      values.add(value);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

function parseStep(raw: string, name: string, expression: string): number {
  const step = parseInt(raw, 10);
  if (!Number.isFinite(step) || step <= 0) {
    throw createCronError(name, expression);
  }
  return step;
}

function normalizeDayOfWeek(values: CronField): CronField {
  const normalized = new Set<number>();
  for (const value of values) {
    normalized.add(value === 7 ? 0 : value);
  }
  return Array.from(normalized).sort((a, b) => a - b);
}

function createCronError(field: string, expression: string): ConfigurationError {
  return new ConfigurationError({
    details: { expression, field },
    message: `Invalid MFT cron ${field} field`,
    retryable: false,
  });
}
