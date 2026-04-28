import { describe, expect, it } from "vitest";
import { ConfigurationError, ScheduleRegistry, type MftSchedule } from "../../../src/index";

const baseSchedule: MftSchedule = {
  id: "alpha",
  routeId: "route-1",
  trigger: { everyMs: 60_000, kind: "interval" },
};

describe("ScheduleRegistry", () => {
  it("registers, looks up, and lists schedules in order", () => {
    const registry = new ScheduleRegistry();

    registry.register(baseSchedule).register({ ...baseSchedule, id: "beta" });

    expect(registry.size).toBe(2);
    expect(registry.has("alpha")).toBe(true);
    expect(registry.get("alpha")).toEqual(baseSchedule);
    expect(registry.list().map((schedule) => schedule.id)).toEqual(["alpha", "beta"]);
    expect(registry.require("beta").routeId).toBe("route-1");
  });

  it("seeds schedules through the constructor", () => {
    const registry = new ScheduleRegistry([baseSchedule]);
    expect(registry.size).toBe(1);
  });

  it("rejects duplicates and missing required fields", () => {
    const registry = new ScheduleRegistry();

    registry.register(baseSchedule);
    expect(() => registry.register(baseSchedule)).toThrow(/already registered/);
    expect(() => registry.register({ ...baseSchedule, id: "" })).toThrow(ConfigurationError);
  });

  it("removes schedules through unregister and throws for missing ids", () => {
    const registry = new ScheduleRegistry([baseSchedule]);

    expect(registry.unregister("alpha")).toBe(true);
    expect(registry.unregister("alpha")).toBe(false);
    expect(() => registry.require("alpha")).toThrow(ConfigurationError);
  });
});
