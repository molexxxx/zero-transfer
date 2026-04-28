import { describe, expect, it } from "vitest";
import {
  createMemoryProviderFactory,
  createTransferClient,
  runConnectionDiagnostics,
  summarizeClientDiagnostics,
} from "../../../src/index";

describe("summarizeClientDiagnostics", () => {
  it("returns a snapshot of registered providers", () => {
    const client = createTransferClient({ providers: [createMemoryProviderFactory()] });
    const summary = summarizeClientDiagnostics(client);
    expect(summary.providers.map((entry) => entry.id)).toEqual(["memory"]);
    expect(summary.providers[0]?.capabilities.list).toBe(true);
  });
});

describe("runConnectionDiagnostics", () => {
  it("connects, samples a directory, and reports timings", async () => {
    const client = createTransferClient({
      providers: [
        createMemoryProviderFactory({
          entries: [{ path: "/probe.txt", type: "file", content: "hi" }],
        }),
      ],
    });
    let nowValue = 0;
    const now = (): number => {
      nowValue += 5;
      return nowValue;
    };
    const result = await runConnectionDiagnostics({
      client,
      now,
      profile: { host: "memory", provider: "memory" },
      sampleSize: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.provider).toBe("memory");
    expect(result.host).toBe("memory");
    expect(result.timings.connectMs).toBe(5);
    expect(result.timings.listMs).toBe(5);
    expect(result.timings.disconnectMs).toBe(5);
    expect(result.sample?.length).toBe(1);
    expect(result.error).toBeUndefined();
    expect(result.redactedProfile["host"]).toBe("memory");
  });

  it("captures errors when the probe path is missing", async () => {
    const client = createTransferClient({ providers: [createMemoryProviderFactory()] });
    const result = await runConnectionDiagnostics({
      client,
      listPath: "/missing-folder",
      profile: { host: "memory", provider: "memory" },
    });
    expect(result.ok).toBe(false);
    expect(result.error?.message.length).toBeGreaterThan(0);
  });
});
