import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  nextCronFireAt,
  nextScheduleFireAt,
  parseCronExpression,
  validateSchedule,
  type MftSchedule,
} from "../../../src/index";

describe("parseCronExpression", () => {
  it("parses wildcard, lists, ranges, and step values", () => {
    const expression = parseCronExpression("*/15 0,12 1-3 */2 0");

    expect(expression.minute).toEqual([0, 15, 30, 45]);
    expect(expression.hour).toEqual([0, 12]);
    expect(expression.dayOfMonth).toEqual([1, 2, 3]);
    expect(expression.month).toEqual([1, 3, 5, 7, 9, 11]);
    expect(expression.dayOfWeek).toEqual([0]);
    expect(expression.hasDomConstraint).toBe(true);
    expect(expression.hasDowConstraint).toBe(true);
  });

  it("normalizes day-of-week 7 to 0 (Sunday)", () => {
    expect(parseCronExpression("0 0 * * 7").dayOfWeek).toEqual([0]);
    expect(parseCronExpression("0 0 * * 0").dayOfWeek).toEqual([0]);
  });

  it("rejects malformed expressions", () => {
    expect(() => parseCronExpression("a b c d e")).toThrow(ConfigurationError);
    expect(() => parseCronExpression("0 0 * *")).toThrow(/5 fields/);
    expect(() => parseCronExpression("60 0 * * *")).toThrow(ConfigurationError);
    expect(() => parseCronExpression("*/0 0 * * *")).toThrow(ConfigurationError);
    expect(() => parseCronExpression("5-1 0 * * *")).toThrow(ConfigurationError);
  });
});

describe("nextCronFireAt", () => {
  it("returns the next minute matching the expression in UTC", () => {
    const expression = parseCronExpression("*/30 * * * *");
    const next = nextCronFireAt(expression, new Date("2026-04-28T10:05:00.000Z"));

    expect(next?.toISOString()).toBe("2026-04-28T10:30:00.000Z");
  });

  it("supports day-of-month OR day-of-week semantics when both are constrained", () => {
    // Fires at midnight on the 1st of the month OR every Friday.
    const expression = parseCronExpression("0 0 1 * 5");
    const next = nextCronFireAt(expression, new Date("2026-04-28T00:00:00.000Z"));

    // Next match: Friday May 1, 2026 (which is also dom 1).
    expect(next?.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("respects the local timezone option", () => {
    const expression = parseCronExpression("0 0 * * *");
    const local = nextCronFireAt(expression, new Date("2026-04-28T12:00:00.000Z"), "local");
    expect(local).toBeInstanceOf(Date);
    expect(local && local.getHours()).toBe(0);
  });
});

describe("validateSchedule + nextScheduleFireAt", () => {
  const intervalSchedule: MftSchedule = {
    id: "every-5",
    routeId: "alpha",
    trigger: { everyMs: 5 * 60_000, kind: "interval" },
  };

  it("validates interval schedules and returns the next fire", () => {
    expect(validateSchedule(intervalSchedule)).toBe(intervalSchedule);

    const next = nextScheduleFireAt(intervalSchedule, new Date("2026-04-28T00:00:00.000Z"));
    expect(next?.getTime()).toBe(new Date("2026-04-28T00:05:00.000Z").getTime());
  });

  it("anchors interval schedules to the supplied anchor", () => {
    const schedule: MftSchedule = {
      ...intervalSchedule,
      trigger: { anchor: new Date("2026-04-28T00:01:00.000Z"), everyMs: 60_000, kind: "interval" },
    };

    const next = nextScheduleFireAt(schedule, new Date("2026-04-28T00:01:30.000Z"));
    expect(next?.toISOString()).toBe("2026-04-28T00:02:00.000Z");
  });

  it("returns the anchor itself when the anchor is in the future", () => {
    const schedule: MftSchedule = {
      ...intervalSchedule,
      trigger: { anchor: new Date("2026-05-01T00:00:00.000Z"), everyMs: 60_000, kind: "interval" },
    };

    const next = nextScheduleFireAt(schedule, new Date("2026-04-28T00:00:00.000Z"));
    expect(next?.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("rejects malformed schedules", () => {
    expect(() => validateSchedule({ ...intervalSchedule, id: "" })).toThrow(ConfigurationError);
    expect(() => validateSchedule({ ...intervalSchedule, routeId: "" })).toThrow(
      /non-empty route id/,
    );
    expect(() =>
      validateSchedule({
        ...intervalSchedule,
        trigger: { everyMs: 0, kind: "interval" },
      }),
    ).toThrow(/positive finite/);
  });

  it("computes the next cron fire", () => {
    const schedule: MftSchedule = {
      id: "hourly",
      routeId: "alpha",
      trigger: { expression: "0 * * * *", kind: "cron" },
    };

    const next = nextScheduleFireAt(schedule, new Date("2026-04-28T10:30:00.000Z"));
    expect(next?.toISOString()).toBe("2026-04-28T11:00:00.000Z");
  });
});
