import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  createAtomicDeployPlan,
  type RemoteTreeDiff,
  type RemoteTreeDiffEntry,
} from "../../../src/index";

describe("createAtomicDeployPlan", () => {
  it("plans staging upload, rename activation, and retains within the window", () => {
    const diff = createDiff([added("/index.html", 12), added("/app.js", 20)]);

    const plan = createAtomicDeployPlan({
      destination: { provider: "ftp", rootPath: "/var/www/site" },
      diff,
      existingReleases: [
        "/var/www/site/.releases/2030-05-01T00-00-00-000Z",
        "/var/www/site/.releases/2030-05-15T00-00-00-000Z",
        "/var/www/site/.releases/2030-05-20T00-00-00-000Z",
      ],
      id: "deploy-1",
      now: () => new Date("2030-06-01T12:00:00Z"),
      retain: 2,
      source: { provider: "memory", rootPath: "/build" },
    });

    expect(plan.releaseId).toBe("2030-06-01T12-00-00-000Z");
    expect(plan.strategy).toBe("rename");
    expect(plan.livePath).toBe("/var/www/site");
    expect(plan.releasesRoot).toBe("/var/www/site/.releases");
    expect(plan.stagingPath).toBe("/var/www/site/.releases/2030-06-01T12-00-00-000Z");
    expect(plan.backupPath).toBe("/var/www/site/.releases/2030-06-01T12-00-00-000Z.previous");
    expect(plan.provider).toBe("ftp");

    expect(plan.uploadPlan.steps).toHaveLength(2);
    const uploadDestinationPaths = plan.uploadPlan.steps.map(
      (step) => step.destination?.path,
    );
    expect(uploadDestinationPaths).toEqual(
      expect.arrayContaining([
        "/var/www/site/.releases/2030-06-01T12-00-00-000Z/index.html",
        "/var/www/site/.releases/2030-06-01T12-00-00-000Z/app.js",
      ]),
    );

    expect(plan.activate.map((step) => step.operation)).toEqual(["rename", "rename"]);
    const promote = plan.activate.find((step) => step.id.endsWith("/promote"));
    expect(promote).toMatchObject({
      destructive: true,
      fromPath: "/var/www/site/.releases/2030-06-01T12-00-00-000Z",
      provider: "ftp",
      toPath: "/var/www/site",
    });

    // retain=2 keeps 1 prior release; oldest is pruned (sorted asc).
    expect(plan.prune.map((step) => step.path)).toEqual([
      "/var/www/site/.releases/2030-05-01T00-00-00-000Z",
      "/var/www/site/.releases/2030-05-15T00-00-00-000Z",
    ]);
  });

  it("plans symlink activation when strategy is symlink and skips backup", () => {
    const plan = createAtomicDeployPlan({
      destination: { rootPath: "/srv/app" },
      diff: createDiff([added("/server.js", 64)]),
      id: "deploy-symlink",
      now: () => new Date("2030-06-01T00:00:00Z"),
      releaseId: "rel-1",
      source: { rootPath: "/build" },
      strategy: "symlink",
    });

    expect(plan.backupPath).toBeUndefined();
    expect(plan.activate).toHaveLength(1);
    expect(plan.activate[0]).toMatchObject({
      destructive: true,
      fromPath: "/srv/app/.releases/rel-1",
      operation: "symlink",
      toPath: "/srv/app",
    });
    expect(plan.stagingPath).toBe("/srv/app/.releases/rel-1");
  });

  it("emits no prune steps when existing releases fit inside the retain window", () => {
    const plan = createAtomicDeployPlan({
      destination: { rootPath: "/srv/app" },
      diff: createDiff([added("/index.html", 1)]),
      existingReleases: ["/srv/app/.releases/old"],
      id: "deploy-retain",
      retain: 5,
      source: { rootPath: "/build" },
    });

    expect(plan.prune).toHaveLength(0);
  });

  it("rejects retain less than 1 and rejects deploying onto root", () => {
    expect(() =>
      createAtomicDeployPlan({
        destination: { rootPath: "/srv/app" },
        diff: createDiff([]),
        id: "deploy-bad-retain",
        retain: 0,
        source: { rootPath: "/build" },
      }),
    ).toThrow(ConfigurationError);

    expect(() =>
      createAtomicDeployPlan({
        destination: { rootPath: "/" },
        diff: createDiff([]),
        id: "deploy-root",
        source: { rootPath: "/build" },
      }),
    ).toThrow(ConfigurationError);
  });
});

function createDiff(entries: RemoteTreeDiffEntry[]): RemoteTreeDiff {
  const summary = {
    added: entries.filter((entry) => entry.status === "added").length,
    modified: 0,
    removed: 0,
    total: entries.length,
    unchanged: 0,
  };
  return { entries, summary };
}

function added(path: string, size: number): RemoteTreeDiffEntry {
  return {
    path,
    reasons: [],
    source: {
      name: path.split("/").filter(Boolean).pop() ?? "/",
      path,
      size,
      type: "file",
    },
    status: "added",
  };
}
