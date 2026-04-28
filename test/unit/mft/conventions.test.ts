import { describe, expect, it } from "vitest";
import {
  DEFAULT_FAILED_SUBDIR,
  DEFAULT_PROCESSED_SUBDIR,
  createInboxRoute,
  createOutboxRoute,
  inboxFailedPath,
  inboxProcessedPath,
  type MftInboxConvention,
} from "../../../src/index";

const profile = { host: "memory.local", provider: "memory" } as const;

describe("inbox conventions", () => {
  const inbox: MftInboxConvention = {
    basePath: "/incoming",
    profile,
  };

  it("computes default processed and failed paths", () => {
    expect(inboxProcessedPath(inbox)).toBe(`/incoming/${DEFAULT_PROCESSED_SUBDIR}`);
    expect(inboxFailedPath(inbox)).toBe(`/incoming/${DEFAULT_FAILED_SUBDIR}`);
  });

  it("honors custom processed/failed subdirs", () => {
    const custom: MftInboxConvention = {
      ...inbox,
      failedSubdir: "errored",
      processedSubdir: "done",
    };
    expect(inboxProcessedPath(custom)).toBe("/incoming/done");
    expect(inboxFailedPath(custom)).toBe("/incoming/errored");
  });

  it("creates an inbox route with derived metadata", () => {
    const route = createInboxRoute({
      destination: { path: "/local/out", profile },
      id: "inbox-1",
      inbox: { ...inbox, filter: { include: ["*.csv"] } },
      metadata: { tenant: "acme" },
      name: "Daily inbox",
    });

    expect(route).toMatchObject({
      destination: { path: "/local/out", profile },
      filter: { include: ["*.csv"] },
      id: "inbox-1",
      name: "Daily inbox",
      source: { path: "/incoming", profile },
    });
    const inboxMeta = route.metadata?.inbox as {
      processedPath: string;
      failedPath: string;
      basePath: string;
    };
    expect(inboxMeta.processedPath).toBe("/incoming/processed");
    expect(inboxMeta.failedPath).toBe("/incoming/failed");
    expect(inboxMeta.basePath).toBe("/incoming");
    expect(route.metadata?.tenant).toBe("acme");
  });

  it("forwards optional fields only when provided", () => {
    const route = createInboxRoute({
      destination: { path: "/out", profile },
      enabled: false,
      id: "inbox-2",
      inbox,
      operation: "download",
    });

    expect(route.enabled).toBe(false);
    expect(route.operation).toBe("download");
    expect(route.name).toBeUndefined();
    expect(route.filter).toBeUndefined();
  });
});

describe("outbox conventions", () => {
  it("creates an outbox route pointing at the base path", () => {
    const route = createOutboxRoute({
      description: "Daily drop",
      id: "outbox-1",
      outbox: { basePath: "/drop", profile },
      source: { path: "/local/in", profile },
    });

    expect(route).toMatchObject({
      description: "Daily drop",
      destination: { path: "/drop", profile },
      id: "outbox-1",
      source: { path: "/local/in", profile },
    });
    expect((route.metadata?.outbox as { basePath: string }).basePath).toBe("/drop");
  });
});
