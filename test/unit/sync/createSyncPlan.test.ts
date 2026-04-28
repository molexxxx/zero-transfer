import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  createSyncPlan,
  createTransferJobsFromPlan,
  summarizeTransferPlan,
  type RemoteEntry,
  type RemoteTreeDiff,
  type RemoteTreeDiffEntry,
} from "../../../src/index";

const sourceEndpoint = { provider: "memory", rootPath: "/src" } as const;
const destinationEndpoint = { provider: "memory", rootPath: "/dst" } as const;

describe("createSyncPlan", () => {
  it("plans copies for added entries when syncing source-to-destination", () => {
    const diff = createDiff([
      added("/file.txt", { size: 10 }),
      added("/dir", { type: "directory" }),
    ]);

    const plan = createSyncPlan({
      destination: destinationEndpoint,
      diff,
      id: "plan-1",
      now: () => new Date("2030-01-01T00:00:00Z"),
      source: sourceEndpoint,
    });

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]).toMatchObject({
      action: "copy",
      destination: { path: "/dst/file.txt", provider: "memory" },
      expectedBytes: 10,
      source: { path: "/src/file.txt", provider: "memory" },
    });
    expect(plan.steps[0]?.destructive).toBeUndefined();

    const jobs = createTransferJobsFromPlan(plan);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.operation).toBe("copy");
  });

  it("includes directory steps when includeDirectoryActions is true", () => {
    const diff = createDiff([added("/dir", { type: "directory" })]);

    const plan = createSyncPlan({
      destination: destinationEndpoint,
      diff,
      id: "plan-dirs",
      includeDirectoryActions: true,
      source: sourceEndpoint,
    });

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]?.action).toBe("copy");
  });

  it("preserves destination-only entries by default and deletes on mirror policy", () => {
    const diff = createDiff([removed("/orphan.txt", { size: 4 })]);

    const preserved = createSyncPlan({
      destination: destinationEndpoint,
      diff,
      id: "plan-preserve",
      source: sourceEndpoint,
    });
    expect(preserved.steps[0]).toMatchObject({ action: "skip" });

    const mirrored = createSyncPlan({
      deletePolicy: "mirror",
      destination: destinationEndpoint,
      diff,
      id: "plan-mirror",
      source: sourceEndpoint,
    });
    expect(mirrored.steps[0]).toMatchObject({
      action: "delete",
      destination: { path: "/dst/orphan.txt", provider: "memory" },
      destructive: true,
    });
  });

  it("supports overwrite, prefer-destination, skip, and error conflict policies", () => {
    const diff = createDiff([
      modified("/conflict.txt", ["size", "modifiedAt"], { size: 7 }, { size: 8 }),
    ]);

    const overwrite = createSyncPlan({
      destination: destinationEndpoint,
      diff,
      id: "plan-overwrite",
      source: sourceEndpoint,
    });
    expect(overwrite.steps[0]).toMatchObject({
      action: "copy",
      destructive: true,
      source: { path: "/src/conflict.txt", provider: "memory" },
      destination: { path: "/dst/conflict.txt", provider: "memory" },
    });

    const preferDestination = createSyncPlan({
      conflictPolicy: "prefer-destination",
      destination: destinationEndpoint,
      diff,
      id: "plan-prefer-dst",
      source: sourceEndpoint,
    });
    expect(preferDestination.steps[0]).toMatchObject({
      action: "copy",
      destructive: true,
      source: { path: "/dst/conflict.txt", provider: "memory" },
      destination: { path: "/src/conflict.txt", provider: "memory" },
    });

    const skipped = createSyncPlan({
      conflictPolicy: "skip",
      destination: destinationEndpoint,
      diff,
      id: "plan-skip",
      source: sourceEndpoint,
    });
    expect(skipped.steps[0]).toMatchObject({ action: "skip" });

    expect(() =>
      createSyncPlan({
        conflictPolicy: "error",
        destination: destinationEndpoint,
        diff,
        id: "plan-error",
        source: sourceEndpoint,
      }),
    ).toThrow(ConfigurationError);
  });

  it("inverts copy direction for destination-to-source sync", () => {
    const diff = createDiff([
      added("/only-source.txt", { size: 1 }),
      removed("/only-destination.txt", { size: 2 }),
    ]);

    const plan = createSyncPlan({
      deletePolicy: "mirror",
      destination: destinationEndpoint,
      diff,
      direction: "destination-to-source",
      id: "plan-rev",
      source: sourceEndpoint,
    });

    const summary = summarizeTransferPlan(plan);
    expect(summary.totalSteps).toBe(2);
    const byAction = plan.steps.map((step) => step.action).sort();
    expect(byAction).toEqual(["copy", "delete"]);
    const copyStep = plan.steps.find((step) => step.action === "copy");
    expect(copyStep).toMatchObject({
      destination: { path: "/src/only-destination.txt", provider: "memory" },
      source: { path: "/dst/only-destination.txt", provider: "memory" },
    });
  });
});

function createDiff(entries: RemoteTreeDiffEntry[]): RemoteTreeDiff {
  const summary = {
    added: entries.filter((entry) => entry.status === "added").length,
    modified: entries.filter((entry) => entry.status === "modified").length,
    removed: entries.filter((entry) => entry.status === "removed").length,
    total: entries.length,
    unchanged: entries.filter((entry) => entry.status === "unchanged").length,
  };
  return { entries, summary };
}

function added(
  path: string,
  metadata: { size?: number; type?: "file" | "directory" } = {},
): RemoteTreeDiffEntry {
  return {
    path,
    reasons: [],
    source: makeEntry(path, metadata),
    status: "added",
  };
}

function removed(
  path: string,
  metadata: { size?: number; type?: "file" | "directory" } = {},
): RemoteTreeDiffEntry {
  return {
    destination: makeEntry(path, metadata),
    path,
    reasons: [],
    status: "removed",
  };
}

function modified(
  path: string,
  reasons: RemoteTreeDiffEntry["reasons"],
  source: { size?: number },
  destination: { size?: number },
): RemoteTreeDiffEntry {
  return {
    destination: makeEntry(path, destination),
    path,
    reasons,
    source: makeEntry(path, source),
    status: "modified",
  };
}

function makeEntry(
  path: string,
  metadata: { size?: number; type?: "file" | "directory" } = {},
): RemoteEntry {
  const type = metadata.type ?? "file";
  const entry: RemoteEntry = {
    name: path.split("/").filter(Boolean).pop() ?? "/",
    path,
    type,
  };
  if (metadata.size !== undefined) entry.size = metadata.size;
  return entry;
}
