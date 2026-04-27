import { describe, expect, it, vi } from "vitest";
import { emitLog, noopLogger, type LoggerMethod } from "../../../src/logging/Logger";

describe("Logger", () => {
  it("emits structured log records when a logger method exists", () => {
    const info = vi.fn<LoggerMethod>();

    emitLog({ info }, "info", {
      component: "client",
      message: "Connected",
      protocol: "ftp",
    });

    expect(info).toHaveBeenCalledWith(
      {
        component: "client",
        level: "info",
        message: "Connected",
        protocol: "ftp",
      },
      "Connected",
    );
  });

  it("ignores missing logger levels and no-op methods", () => {
    expect(() => emitLog({}, "debug", { message: "hidden" })).not.toThrow();
    expect(() => noopLogger.info({ level: "info", message: "noop" })).not.toThrow();
  });
});
