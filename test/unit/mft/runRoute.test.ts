import { Buffer } from "node:buffer";
import { describe, expect, it, vi } from "vitest";
import {
  ConfigurationError,
  TransferEngine,
  createMemoryProviderFactory,
  createTransferClient,
  runRoute,
  type MftRoute,
  type MemoryProviderEntry,
} from "../../../src/index";

function createRouteClient(entries: MemoryProviderEntry[] = []) {
  return createTransferClient({ providers: [createMemoryProviderFactory({ entries })] });
}

function createRoute(overrides: Partial<MftRoute> = {}): MftRoute {
  return {
    destination: { path: "/out/data.bin", profile: { host: "memory.local", provider: "memory" } },
    id: "route-1",
    name: "demo",
    source: { path: "/in/data.bin", profile: { host: "memory.local", provider: "memory" } },
    ...overrides,
  };
}

const fixtureContent = Buffer.from("zero-transfer-mft");

describe("runRoute", () => {
  it("dispatches a transfer through the engine and returns a receipt", async () => {
    const client = createRouteClient([
      { content: fixtureContent, path: "/in/data.bin", type: "file" },
    ]);
    const onProgress = vi.fn();
    const route = createRoute({ metadata: { tier: "gold" } });
    const receipt = await runRoute({
      bandwidthLimit: { bytesPerSecond: 1024 },
      client,
      jobId: "job-explicit",
      metadata: { runId: "run-1" },
      onProgress,
      route,
    });

    expect(receipt.jobId).toBe("job-explicit");
    expect(receipt.operation).toBe("copy");
    expect(receipt.source).toEqual({ path: "/in/data.bin", provider: "memory" });
    expect(receipt.destination).toEqual({ path: "/out/data.bin", provider: "memory" });
    expect(receipt.bytesTransferred).toBe(fixtureContent.byteLength);
    expect(receipt.metadata).toEqual({
      routeId: "route-1",
      routeName: "demo",
      runId: "run-1",
      tier: "gold",
    });
    expect(onProgress).toHaveBeenCalled();

    const session = await client.connect({ host: "memory.local", provider: "memory" });
    try {
      const stat = await session.fs.stat("/out/data.bin");
      expect(stat.exists).toBe(true);
      expect(stat.size).toBe(fixtureContent.byteLength);
    } finally {
      await session.disconnect();
    }
  });

  it("derives a deterministic default job id from the supplied clock", async () => {
    const client = createRouteClient([
      { content: fixtureContent, path: "/in/data.bin", type: "file" },
    ]);
    const fixedNow = new Date("2026-04-28T00:00:00.000Z");
    const receipt = await runRoute({
      client,
      now: () => fixedNow,
      route: createRoute({ id: "scheduled" }),
    });

    expect(receipt.jobId).toBe(`route:scheduled:${fixedNow.getTime().toString(36)}`);
  });

  it("falls back to a wall-clock job id when no clock is supplied", async () => {
    const client = createRouteClient([
      { content: fixtureContent, path: "/in/data.bin", type: "file" },
    ]);

    const receipt = await runRoute({ client, route: createRoute({ id: "wall" }) });

    expect(receipt.jobId).toMatch(/^route:wall:[0-9a-z]+$/);
  });

  it("respects an injected engine override", async () => {
    const client = createRouteClient([
      { content: fixtureContent, path: "/in/data.bin", type: "file" },
    ]);
    const engine = new TransferEngine();
    const executeSpy = vi.spyOn(engine, "execute");

    await runRoute({ client, engine, route: createRoute() });

    expect(executeSpy).toHaveBeenCalledOnce();
  });

  it("throws ConfigurationError for disabled routes without opening sessions", async () => {
    const client = createRouteClient();

    await expect(
      runRoute({ client, route: createRoute({ enabled: false, id: "off" }) }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("disconnects both sessions even when the destination connection fails", async () => {
    const client = createRouteClient([
      { content: fixtureContent, path: "/in/data.bin", type: "file" },
    ]);
    const route = createRoute({
      destination: {
        path: "/out/data.bin",
        profile: { host: "missing.local", provider: "missing-provider" },
      },
    });

    await expect(runRoute({ client, route })).rejects.toBeDefined();
  });
});
