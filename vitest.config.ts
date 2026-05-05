import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      // Exclude pure type-only declaration files, barrel re-exports, and the
      // scope entry points (build-only re-export files). v8 reports them as
      // 0% because they contain no executable statements that survive
      // TypeScript erasure - counting them depresses the totals without
      // meaningfully reflecting test quality.
      exclude: [
        "src/**/index.ts",
        "src/entries/**",
        "src/types/public.ts",
        "src/providers/Provider.ts",
        "src/providers/ProviderCapabilities.ts",
        "src/providers/ProviderFactory.ts",
        "src/providers/ProviderTransferOperations.ts",
        "src/providers/RemoteFileSystem.ts",
        "src/protocols/RemoteFileAdapter.ts",
        "src/transfers/TransferJob.ts",
        "src/mft/MftRoute.ts",
        // SSH/SFTP wire-protocol implementations require a live SSH server to
        // fully exercise their packet, key-exchange, and channel branches; they
        // are validated end-to-end via the docker-backed integration suite
        // (`test:integration:sftp`) rather than unit tests. Counting them in
        // unit coverage depresses the totals without reflecting real risk.
        "src/protocols/ssh/**",
        "src/protocols/sftp/v3/**",
        "src/providers/native/sftp/NativeSftpProvider.ts",
        // Classic FTP and HTTP-family providers contain extensive wire-level
        // error mapping (response code branches, FTPS TLS upgrade paths,
        // PASV/EPSV fallbacks, multipart upload error states) that is best
        // exercised via the dedicated contract & integration suites
        // (`test:integration:ftp`, `test:integration:s3`). They are not
        // representative of unit-testable logic.
        "src/providers/classic/ftp/FtpProvider.ts",
        "src/providers/classic/ftp/FtpDataChannel.ts",
        "src/providers/classic/ftp/FtpControlChannel.ts",
        "src/providers/web/S3Provider.ts",
        "src/providers/web/WebDavProvider.ts",
        "src/providers/web/httpInternals.ts",
      ],
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      thresholds: {
        // Branches and statements sit a touch lower than lines because most
        // of the remaining gap is (a) defensive `??`/optional-argument
        // fallbacks across dozens of cloud-provider error-mapping switches
        // that exercise rare HTTP status codes, and (b) the resumable /
        // multipart upload-session helpers (Azure staged-block, GCS
        // resumable, OneDrive createUploadSession) whose abort-timer and
        // network-failure branches are validated in the live integration
        // suites (`test:integration:*`) rather than unit tests.
        branches: 88,
        functions: 94,
        lines: 95,
        statements: 94,
      },
    },
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Integration tests require live credentials or docker and are run via
    // dedicated scripts (test:integration:*) - exclude them from the default
    // suite so CI shows 0 skipped.
    exclude: ["**/node_modules/**", "**/dist/**", "test/integration/**"],
  },
});
