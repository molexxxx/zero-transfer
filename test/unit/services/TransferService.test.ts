import { describe, expect, it } from "vitest";
import { createProgressEvent, createTransferResult } from "../../../src/services/TransferService";

describe("TransferService", () => {
  it("creates transfer results with timing and verification metadata", () => {
    const startedAt = new Date("2026-04-27T00:00:00.000Z");
    const completedAt = new Date("2026-04-27T00:00:02.000Z");
    const result = createTransferResult({
      bytesTransferred: 2048,
      checksum: "sha256:abc",
      completedAt,
      destinationPath: "/remote/file.txt",
      resumed: true,
      sourcePath: "./file.txt",
      startedAt,
      verified: true,
    });

    expect(result).toMatchObject({
      averageBytesPerSecond: 1024,
      bytesTransferred: 2048,
      checksum: "sha256:abc",
      destinationPath: "/remote/file.txt",
      durationMs: 2000,
      resumed: true,
      sourcePath: "./file.txt",
      verified: true,
    });
  });

  it("uses safe defaults for instant unverified transfers", () => {
    const startedAt = new Date("2026-04-27T00:00:00.000Z");
    const result = createTransferResult({
      bytesTransferred: 10,
      completedAt: startedAt,
      destinationPath: "/remote/file.txt",
      startedAt,
    });

    expect(result.averageBytesPerSecond).toBe(10);
    expect(result.resumed).toBe(false);
    expect(result.verified).toBe(false);
  });

  it("creates progress events with rates and percentages", () => {
    const startedAt = new Date("2026-04-27T00:00:00.000Z");
    const event = createProgressEvent({
      bytesTransferred: 512,
      now: new Date("2026-04-27T00:00:01.000Z"),
      startedAt,
      totalBytes: 1024,
      transferId: "transfer-1",
    });

    expect(event).toMatchObject({
      bytesPerSecond: 512,
      elapsedMs: 1000,
      percent: 50,
      totalBytes: 1024,
      transferId: "transfer-1",
    });

    expect(
      createProgressEvent({
        bytesTransferred: 1,
        now: startedAt,
        startedAt,
        totalBytes: 0,
        transferId: "transfer-2",
      }).percent,
    ).toBe(0);
    expect(
      createProgressEvent({ bytesTransferred: 5, startedAt, transferId: "transfer-3" }).totalBytes,
    ).toBeUndefined();
  });
});
