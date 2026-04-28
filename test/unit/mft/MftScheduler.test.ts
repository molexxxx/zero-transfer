import { Buffer } from "node:buffer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MftScheduler,
  RouteRegistry,
  ScheduleRegistry,
  createMemoryProviderFactory,
  createTransferClient,
  type MemoryProviderEntry,
  type MftRoute,
  type MftSchedule,
  type ScheduleRouteRunner,
  type TransferReceipt,
} from "../../../src/index";

const baseRoute: MftRoute = {
  destination: { path: "/out/data.bin", profile: { host: "memory.local", provider: "memory" } },
  id: "route-1",
  source: { path: "/in/data.bin", profile: { host: "memory.local", provider: "memory" } },
};

const everyMinute: MftSchedule = {
  id: "every-1",
  routeId: "route-1",
  trigger: { everyMs: 60_000, kind: "interval" },
};

function createReceipt(jobId: string): TransferReceipt {
  const startedAt = new Date();
  return {
    attempts: [],
    averageBytesPerSecond: 0,
    bytesTransferred: 0,
    completedAt: startedAt,
    destination: { path: "/out/data.bin", provider: "memory" },
    durationMs: 0,
    jobId,
    operation: "copy",
    resumed: false,
    source: { path: "/in/data.bin", provider: "memory" },
    startedAt,
    transferId: jobId,
    verified: false,
    warnings: [],
  };
}

function createMemoryClient(entries: MemoryProviderEntry[] = []) {
  return createTransferClient({ providers: [createMemoryProviderFactory({ entries })] });
}

describe("MftScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-28T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires interval schedules on time and reschedules after each run", async () => {
    const onFire = vi.fn();
    const onResult = vi.fn<(input: { schedule: MftSchedule; receipt: TransferReceipt }) => void>();
    const runner: ScheduleRouteRunner = vi.fn((input: Parameters<ScheduleRouteRunner>[0]) => {
      expect(input.schedule.id).toBe("every-1");
      expect(input.route.id).toBe("route-1");
      expect(input.signal.aborted).toBe(false);
      return Promise.resolve(createReceipt(`job-${onResult.mock.calls.length + 1}`));
    });

    const routes = new RouteRegistry([baseRoute]);
    const schedules = new ScheduleRegistry([everyMinute]);
    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      onFire,
      onResult,
      routes,
      runner,
      schedules,
    });

    scheduler.start();
    expect(scheduler.isRunning).toBe(true);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(runner).toHaveBeenCalledTimes(1);
    expect(onFire).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(runner).toHaveBeenCalledTimes(2);

    await scheduler.stop();
    expect(scheduler.isRunning).toBe(false);
  });

  it("skips disabled schedules without firing", async () => {
    const runner: ScheduleRouteRunner = vi.fn(() => Promise.resolve(createReceipt("never")));
    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      routes: new RouteRegistry([baseRoute]),
      runner,
      schedules: new ScheduleRegistry([{ ...everyMinute, enabled: false }]),
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(120_000);
    await scheduler.stop();

    expect(runner).not.toHaveBeenCalled();
  });

  it("surfaces missing-route configuration errors via onError", async () => {
    const onError = vi.fn<(input: { schedule: MftSchedule; error: unknown }) => void>();
    const runner: ScheduleRouteRunner = vi.fn(() => Promise.resolve(createReceipt("never")));

    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      onError,
      routes: new RouteRegistry(),
      runner,
      schedules: new ScheduleRegistry([{ ...everyMinute, routeId: "missing" }]),
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    await scheduler.stop();

    expect(runner).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]?.error).toBeInstanceOf(Error);
  });

  it("surfaces runner failures via onError and continues running", async () => {
    const onError = vi.fn();
    const runner: ScheduleRouteRunner = vi
      .fn<(input: Parameters<ScheduleRouteRunner>[0]) => ReturnType<ScheduleRouteRunner>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(createReceipt("recover"));

    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      onError,
      routes: new RouteRegistry([baseRoute]),
      runner,
      schedules: new ScheduleRegistry([everyMinute]),
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onError).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(60_000);
    expect(runner).toHaveBeenCalledTimes(2);

    await scheduler.stop();
  });

  it("aborts in-flight runs when stop() is called", async () => {
    const aborted: boolean[] = [];
    let releaseRunner!: () => void;
    const runner: ScheduleRouteRunner = (input) =>
      new Promise<TransferReceipt>((resolve) => {
        input.signal.addEventListener("abort", () => {
          aborted.push(true);
          resolve(createReceipt("aborted"));
        });
        releaseRunner = () => resolve(createReceipt("released"));
      });

    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      routes: new RouteRegistry([baseRoute]),
      runner,
      schedules: new ScheduleRegistry([everyMinute]),
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);

    const stopPromise = scheduler.stop();
    expect(aborted).toEqual([true]);
    releaseRunner();
    await stopPromise;
  });

  it("uses runRoute by default when no runner is supplied", async () => {
    const client = createMemoryClient([
      { content: Buffer.from("scheduled"), path: "/in/data.bin", type: "file" },
    ]);
    const onResult = vi.fn<(input: { schedule: MftSchedule; receipt: TransferReceipt }) => void>();
    const scheduler = new MftScheduler({
      client,
      onResult,
      routes: new RouteRegistry([baseRoute]),
      schedules: new ScheduleRegistry([everyMinute]),
    });

    scheduler.start();
    await vi.advanceTimersByTimeAsync(60_000);
    await scheduler.stop();

    expect(onResult).toHaveBeenCalledOnce();
    expect(onResult.mock.calls[0]?.[0]?.receipt.bytesTransferred).toBe(9);
  });

  it("ignores duplicate start() and stop() calls", async () => {
    const scheduler = new MftScheduler({
      client: createMemoryClient(),
      routes: new RouteRegistry(),
      schedules: new ScheduleRegistry(),
    });

    scheduler.start();
    scheduler.start();
    await scheduler.stop();
    await scheduler.stop();

    expect(scheduler.isRunning).toBe(false);
  });
});
