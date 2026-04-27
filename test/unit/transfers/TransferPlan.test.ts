import { describe, expect, it } from "vitest";
import {
  createTransferJobsFromPlan,
  createTransferPlan,
  summarizeTransferPlan,
  type TransferPlanStep,
} from "../../../src/index";

function createSteps(): TransferPlanStep[] {
  return [
    {
      action: "upload",
      destination: { path: "/remote/report.csv", provider: "memory" },
      expectedBytes: 24,
      id: "upload-report",
      metadata: { priority: "high" },
      source: { path: "./report.csv", provider: "local" },
    },
    {
      action: "delete",
      destructive: true,
      id: "delete-old",
      source: { path: "/remote/old.csv", provider: "memory" },
    },
    {
      action: "skip",
      id: "skip-existing",
      reason: "destination already matches",
    },
  ];
}

describe("TransferPlan", () => {
  it("creates immutable dry-run plan snapshots and summaries", () => {
    const steps = createSteps();
    const plan = createTransferPlan({
      id: "plan-1",
      metadata: { source: "fixture" },
      now: () => new Date("2026-04-27T00:00:00.000Z"),
      steps,
      warnings: ["preview only"],
    });

    steps[0]!.source = { path: "./mutated.csv", provider: "local" };

    expect(plan).toMatchObject({
      dryRun: true,
      id: "plan-1",
      metadata: { source: "fixture" },
      warnings: ["preview only"],
    });
    expect(plan.createdAt).toEqual(new Date("2026-04-27T00:00:00.000Z"));
    expect(plan.steps[0]?.source).toEqual({ path: "./report.csv", provider: "local" });
    expect(summarizeTransferPlan(plan)).toEqual({
      actions: { delete: 1, skip: 1, upload: 1 },
      destructiveSteps: 1,
      executableSteps: 2,
      skippedSteps: 1,
      totalExpectedBytes: 24,
      totalSteps: 3,
    });
  });

  it("converts executable plan steps into transfer jobs", () => {
    const steps = createSteps();
    const plan = createTransferPlan({ dryRun: false, id: "plan-1", steps });
    const jobs = createTransferJobsFromPlan(plan);

    expect(jobs).toEqual([
      {
        destination: { path: "/remote/report.csv", provider: "memory" },
        id: "plan-1:upload-report",
        metadata: { priority: "high" },
        operation: "upload",
        source: { path: "./report.csv", provider: "local" },
        totalBytes: 24,
      },
      {
        id: "plan-1:delete-old",
        operation: "delete",
        source: { path: "/remote/old.csv", provider: "memory" },
      },
    ]);
  });
});
