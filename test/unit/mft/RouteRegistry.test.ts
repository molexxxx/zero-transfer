import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ConfigurationError, RouteRegistry, type MftRoute } from "../../../src/index";

const baseRoute: MftRoute = {
  destination: { path: "/out/data.bin", profile: { host: "memory.local", provider: "memory" } },
  id: "alpha",
  source: { path: "/in/data.bin", profile: { host: "memory.local", provider: "memory" } },
};

void Buffer; // keep node:buffer import shape consistent across mft tests

describe("RouteRegistry", () => {
  it("registers, looks up, and lists routes in order", () => {
    const registry = new RouteRegistry();

    registry.register(baseRoute).register({ ...baseRoute, id: "beta" });

    expect(registry.size).toBe(2);
    expect(registry.has("alpha")).toBe(true);
    expect(registry.has("missing")).toBe(false);
    expect(registry.get("alpha")).toEqual(baseRoute);
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.list().map((route) => route.id)).toEqual(["alpha", "beta"]);
  });

  it("seeds routes through the constructor", () => {
    const registry = new RouteRegistry([baseRoute, { ...baseRoute, id: "beta" }]);

    expect(registry.size).toBe(2);
    expect(registry.require("beta").id).toBe("beta");
  });

  it("rejects empty ids and duplicates", () => {
    const registry = new RouteRegistry();

    expect(() => registry.register({ ...baseRoute, id: "" })).toThrow(ConfigurationError);
    registry.register(baseRoute);
    expect(() => registry.register(baseRoute)).toThrow(/already registered/);
  });

  it("throws when requiring a missing route", () => {
    const registry = new RouteRegistry();

    expect(() => registry.require("missing")).toThrow(ConfigurationError);
  });

  it("removes routes through unregister", () => {
    const registry = new RouteRegistry([baseRoute]);

    expect(registry.unregister("alpha")).toBe(true);
    expect(registry.unregister("alpha")).toBe(false);
    expect(registry.size).toBe(0);
  });
});
