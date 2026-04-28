import { describe, expect, it, vi } from "vitest";
import {
  ApprovalRegistry,
  ApprovalRejectedError,
  ConfigurationError,
  createApprovalGate,
  type MftRoute,
  type ScheduleRouteRunner,
  type TransferReceipt,
} from "../../../src/index";

const route: MftRoute = {
  destination: { path: "/out", profile: { host: "memory.local", provider: "memory" } },
  id: "route-1",
  source: { path: "/in", profile: { host: "memory.local", provider: "memory" } },
};

function createReceipt(jobId = "job-1"): TransferReceipt {
  const now = new Date();
  return {
    attempts: [],
    averageBytesPerSecond: 0,
    bytesTransferred: 0,
    completedAt: now,
    destination: { path: "/out", provider: "memory" },
    durationMs: 0,
    jobId,
    operation: "copy",
    resumed: false,
    source: { path: "/in", provider: "memory" },
    startedAt: now,
    transferId: jobId,
    verified: false,
    warnings: [],
  };
}

describe("ApprovalRegistry", () => {
  it("creates pending requests and resolves them on approve", async () => {
    const registry = new ApprovalRegistry();
    const { request, settled } = registry.create({ id: "a", routeId: "route-1" });

    expect(request.status).toBe("pending");
    expect(registry.listPending()).toHaveLength(1);

    const updated = registry.approve("a", { reason: "looks good", resolvedBy: "tony" });
    await expect(settled).resolves.toMatchObject({ status: "approved" });
    expect(updated.status).toBe("approved");
    expect(updated.resolvedBy).toBe("tony");
    expect(registry.listPending()).toHaveLength(0);
    expect(registry.list()).toHaveLength(1);
  });

  it("rejects requests and surfaces ApprovalRejectedError", async () => {
    const registry = new ApprovalRegistry();
    const { settled } = registry.create({ id: "b", routeId: "route-1" });

    registry.reject("b", { reason: "policy violation" });

    await expect(settled).rejects.toBeInstanceOf(ApprovalRejectedError);
  });

  it("rejects malformed creation and double resolution", () => {
    const registry = new ApprovalRegistry();
    expect(() => registry.create({ id: "", routeId: "route-1" })).toThrow(ConfigurationError);

    registry.create({ id: "x", routeId: "route-1" });
    expect(() => registry.create({ id: "x", routeId: "route-1" })).toThrow(/already exists/);

    registry.approve("x");
    expect(() => registry.approve("x")).toThrow(/already approved/);
    expect(() => registry.approve("missing")).toThrow(/not registered/);
  });
});

describe("createApprovalGate", () => {
  it("waits for approval before invoking the runner", async () => {
    const registry = new ApprovalRegistry();
    const runner = vi.fn(() => Promise.resolve(createReceipt()));
    const onRequested = vi.fn();

    const gated: ScheduleRouteRunner = createApprovalGate({
      approvalId: ({ route: r }) => `approval-${r.id}`,
      onRequested,
      registry,
      runner,
    });

    const controller = new AbortController();
    const promise = gated({
      client: {} as never,
      route,
      schedule: { id: "s", routeId: route.id, trigger: { everyMs: 1, kind: "interval" } },
      signal: controller.signal,
    });

    expect(runner).not.toHaveBeenCalled();
    expect(onRequested).toHaveBeenCalledOnce();

    registry.approve("approval-route-1");
    await expect(promise).resolves.toMatchObject({ jobId: "job-1" });
    expect(runner).toHaveBeenCalledOnce();
  });

  it("propagates rejection through the runner promise", async () => {
    const registry = new ApprovalRegistry();
    const runner = vi.fn(() => Promise.resolve(createReceipt()));

    const gated: ScheduleRouteRunner = createApprovalGate({
      approvalId: () => "fixed",
      registry,
      runner,
    });

    const promise = gated({
      client: {} as never,
      route,
      schedule: { id: "s", routeId: route.id, trigger: { everyMs: 1, kind: "interval" } },
      signal: new AbortController().signal,
    });

    registry.reject("fixed", { reason: "no thanks" });
    await expect(promise).rejects.toBeInstanceOf(ApprovalRejectedError);
    expect(runner).not.toHaveBeenCalled();
  });

  it("auto-rejects requests when the abort signal fires", async () => {
    const registry = new ApprovalRegistry();
    const runner = vi.fn(() => Promise.resolve(createReceipt()));
    const controller = new AbortController();

    const gated: ScheduleRouteRunner = createApprovalGate({
      approvalId: () => "abort-test",
      registry,
      runner,
    });

    const promise = gated({
      client: {} as never,
      route,
      schedule: { id: "s", routeId: route.id, trigger: { everyMs: 1, kind: "interval" } },
      signal: controller.signal,
    });

    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(ApprovalRejectedError);
    expect(registry.get("abort-test")?.status).toBe("rejected");
  });
});
