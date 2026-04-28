/**
 * Built-in provider capability matrix.
 *
 * Aggregates the {@link CapabilitySet} advertised by every shipped provider
 * factory so applications, docs, and diagnostics can compare features across
 * providers without instantiating each one. The S3 entry is captured twice —
 * once with multipart upload disabled (default) and once with multipart
 * upload enabled — because that flag flips `resumeUpload`.
 *
 * @module providers/capabilityMatrix
 */
import type { CapabilitySet } from "../core/CapabilitySet";
import type { ProviderId } from "../core/ProviderId";
import { createFtpProviderFactory, createFtpsProviderFactory } from "./classic/ftp";
import { createSftpProviderFactory } from "./classic/sftp";
import { createDropboxProviderFactory } from "./cloud";
import { createLocalProviderFactory } from "./local";
import { createMemoryProviderFactory } from "./memory";
import {
  createHttpProviderFactory,
  createS3ProviderFactory,
  createWebDavProviderFactory,
} from "./web";

/** Identifier for an entry in {@link getBuiltinCapabilityMatrix}. */
export type BuiltinProviderMatrixId =
  | ProviderId
  | "s3:multipart";

/** Single entry in the built-in capability matrix. */
export interface BuiltinCapabilityMatrixEntry {
  /** Stable matrix identifier (provider id, or `s3:multipart` for the multipart variant). */
  id: BuiltinProviderMatrixId;
  /** Human-readable label, suitable for documentation tables. */
  label: string;
  /** Capability snapshot advertised by the provider factory. */
  capabilities: CapabilitySet;
}

const noopFetch: typeof fetch = () => Promise.reject(new Error("capabilityMatrix: fetch unused"));

/**
 * Returns the capability matrix for every shipped provider factory.
 *
 * Each call constructs a fresh factory snapshot, so the result reflects the
 * current build (including any future new metadata or notes). Web providers
 * are constructed with a no-op fetch since capability advertisement does not
 * require a live transport.
 */
export function getBuiltinCapabilityMatrix(): BuiltinCapabilityMatrixEntry[] {
  return [
    {
      capabilities: createLocalProviderFactory().capabilities,
      id: "local",
      label: "Local file system",
    },
    {
      capabilities: createMemoryProviderFactory().capabilities,
      id: "memory",
      label: "In-memory (test fixture)",
    },
    {
      capabilities: createFtpProviderFactory().capabilities,
      id: "ftp",
      label: "FTP",
    },
    {
      capabilities: createFtpsProviderFactory().capabilities,
      id: "ftps",
      label: "FTPS",
    },
    {
      capabilities: createSftpProviderFactory().capabilities,
      id: "sftp",
      label: "SFTP",
    },
    {
      capabilities: createHttpProviderFactory({ fetch: noopFetch }).capabilities,
      id: "http",
      label: "HTTP/HTTPS (read-only)",
    },
    {
      capabilities: createWebDavProviderFactory({ fetch: noopFetch }).capabilities,
      id: "webdav",
      label: "WebDAV",
    },
    {
      capabilities: createS3ProviderFactory({ fetch: noopFetch }).capabilities,
      id: "s3",
      label: "S3-compatible (single-shot uploads)",
    },
    {
      capabilities: createS3ProviderFactory({
        fetch: noopFetch,
        multipart: { enabled: true },
      }).capabilities,
      id: "s3:multipart",
      label: "S3-compatible (multipart uploads)",
    },
    {
      capabilities: createDropboxProviderFactory({ fetch: noopFetch }).capabilities,
      id: "dropbox",
      label: "Dropbox",
    },
  ];
}

/**
 * Renders the matrix returned by {@link getBuiltinCapabilityMatrix} as a
 * GitHub-flavored Markdown table covering the most commonly-compared
 * capability flags.
 */
export function formatCapabilityMatrixMarkdown(
  matrix: ReadonlyArray<BuiltinCapabilityMatrixEntry> = getBuiltinCapabilityMatrix(),
): string {
  const header =
    "| Provider | list | stat | read | write | resume↓ | resume↑ | server-side copy/move | checksums | auth |";
  const divider =
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const rows = matrix.map((entry) => {
    const c = entry.capabilities;
    const yesNo = (value: boolean): string => (value ? "✅" : "❌");
    const sideways = `${yesNo(c.serverSideCopy)} / ${yesNo(c.serverSideMove)}`;
    const checksums = c.checksum.length === 0 ? "—" : c.checksum.join(", ");
    const auth = c.authentication.length === 0 ? "—" : c.authentication.join(", ");
    return `| ${entry.label} | ${yesNo(c.list)} | ${yesNo(c.stat)} | ${yesNo(c.readStream)} | ${yesNo(c.writeStream)} | ${yesNo(c.resumeDownload)} | ${yesNo(c.resumeUpload)} | ${sideways} | ${checksums} | ${auth} |`;
  });
  return [header, divider, ...rows].join("\n");
}
