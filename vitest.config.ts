import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 76,
        functions: 89,
        lines: 88,
        statements: 86,
      },
    },
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Integration tests require live credentials or docker and are run via
    // dedicated scripts (test:integration:*) — exclude them from the default
    // suite so CI shows 0 skipped.
    exclude: ["**/node_modules/**", "**/dist/**", "test/integration/**"],
  },
});
