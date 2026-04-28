/**
 * Diagnostics helpers for inspecting a {@link TransferClient} and probing connection profiles.
 *
 * These helpers are intentionally side-effect-light: they exercise an existing client without
 * mutating registry state and never log secret material. Use them to render setup screens,
 * collect bug-report payloads, or verify a profile after an importer run.
 *
 * @module diagnostics
 */
import type { TransferClient } from "../core/TransferClient";
import type { CapabilitySet } from "../core/CapabilitySet";
import type { ProviderId } from "../core/ProviderId";
import { redactConnectionProfile } from "../profiles/ProfileRedactor";
import type { ConnectionProfile, RemoteEntry } from "../types/public";

/** Snapshot of the providers registered with a client. */
export interface ClientDiagnostics {
  /** Providers currently registered, keyed by id. */
  providers: ReadonlyArray<{ id: ProviderId; capabilities: CapabilitySet }>;
}

/**
 * Returns a redaction-safe snapshot of the providers registered with a client.
 *
 * @param client - Transfer client to inspect.
 * @returns Provider id and capability snapshot tuples.
 */
export function summarizeClientDiagnostics(client: TransferClient): ClientDiagnostics {
  const capabilities = client.getCapabilities();
  return {
    providers: capabilities.map((entry) => ({ capabilities: entry, id: entry.provider })),
  };
}

/** Per-step duration measurements collected by {@link runConnectionDiagnostics}. */
export interface ConnectionDiagnosticTimings {
  /** Total time spent inside `client.connect`. */
  connectMs?: number;
  /** Time spent inside the optional `fs.list` probe. */
  listMs?: number;
  /** Time spent inside the optional `session.disconnect`. */
  disconnectMs?: number;
}

/** Result returned by {@link runConnectionDiagnostics}. */
export interface ConnectionDiagnosticsResult {
  /** Resolved provider id used to open the session. */
  provider?: ProviderId;
  /** Profile host (after redaction). */
  host: string;
  /** Capability snapshot reported by the connected session. */
  capabilities?: CapabilitySet;
  /** Redacted connection profile mirroring {@link redactConnectionProfile}. */
  redactedProfile: Record<string, unknown>;
  /** Per-step duration measurements. */
  timings: ConnectionDiagnosticTimings;
  /** Sample of entries returned by the optional `fs.list` probe. */
  sample?: readonly RemoteEntry[];
  /** Whether all probes ran without throwing. */
  ok: boolean;
  /** Captured error summary when the diagnostics could not complete. */
  error?: { message: string; name?: string; code?: string };
}

/** Options accepted by {@link runConnectionDiagnostics}. */
export interface RunConnectionDiagnosticsOptions {
  /** Transfer client used to open the session. */
  client: TransferClient;
  /** Connection profile to probe. */
  profile: ConnectionProfile;
  /** Path passed to the optional `fs.list` probe. Defaults to `"/"`. */
  listPath?: string;
  /** When `false`, skips the `fs.list` probe. Defaults to `true`. */
  probeList?: boolean;
  /** Maximum number of entries retained in the result sample. Defaults to `5`. */
  sampleSize?: number;
  /** Optional clock injected for deterministic test timings. Defaults to `performance.now`. */
  now?: () => number;
}

/**
 * Connects to a profile, captures capability and listing samples, and returns a redaction-safe report.
 *
 * @param options - Diagnostic probe options.
 * @returns Diagnostic report including timings and any captured error.
 */
export async function runConnectionDiagnostics(
  options: RunConnectionDiagnosticsOptions,
): Promise<ConnectionDiagnosticsResult> {
  const now = options.now ?? (() => performance.now());
  const probeList = options.probeList !== false;
  const listPath = options.listPath ?? "/";
  const sampleSize = Math.max(0, options.sampleSize ?? 5);
  const redactedProfile = redactConnectionProfile(options.profile);

  const result: ConnectionDiagnosticsResult = {
    host: options.profile.host,
    ok: false,
    redactedProfile,
    timings: {},
  };

  const connectStart = now();
  try {
    const session = await options.client.connect(options.profile);
    result.timings.connectMs = now() - connectStart;
    result.provider = session.provider;
    result.capabilities = session.capabilities;
    try {
      if (probeList) {
        const listStart = now();
        const entries = await session.fs.list(listPath);
        result.timings.listMs = now() - listStart;
        result.sample = entries.slice(0, sampleSize);
      }
      result.ok = true;
    } finally {
      const disconnectStart = now();
      await session.disconnect();
      result.timings.disconnectMs = now() - disconnectStart;
    }
  } catch (error) {
    result.error = summarizeDiagnosticError(error);
  }
  return result;
}

function summarizeDiagnosticError(error: unknown): {
  message: string;
  name?: string;
  code?: string;
} {
  if (error instanceof Error) {
    const summary: { message: string; name?: string; code?: string } = { message: error.message };
    if (error.name !== "Error") summary.name = error.name;
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") summary.code = code;
    return summary;
  }
  return { message: String(error) };
}
